import { ArrowBack, Check } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Skeleton,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { APIError } from "../../helpers/fetch";
import {
  useChatSocket,
  useChatroomByProjectId,
  useChatroomDetail,
  useCreateProjectRoom,
  useMessage,
  useSendMessage,
} from "../../queries/chat_hooks";
import {
  useAddProjectMember,
  useLeaveProject,
  useProjectDetail,
  useProjectMembership,
} from "../../queries/project_hooks";
import { useSession } from "../../queries/sesssion_hooks";
import { useUsers } from "../../queries/user_hooks";
import { ChatroomContent } from "../Chatroom";

function Chatroom(props: { chatroom_id: number }) {
  const { chatroom_id } = props;
  const { data: sessionData } = useSession();
  const { data: chatroom } = useChatroomDetail(chatroom_id);
  const { data: messages } = useMessage(chatroom_id);
  const { data: users } = useUsers();
  const reshaped_messages = [];

  if (users && messages) {
    const user_lookup: Record<string, (typeof users)[0]> = {};
    for (const user of users) {
      user_lookup[user.user_id] = user;
    }

    for (const message of messages) {
      const uid = message.user_id;
      const user = user_lookup[uid];
      reshaped_messages.push({
        user_name: user.user_name,
        ...message,
      });
    }
  }

  const { mutate: sendMessage } = useSendMessage(chatroom_id);

  if (!sessionData?.logged) {
    return null;
  }
  if (!chatroom) {
    return <Skeleton />;
  }

  return (
    <Stack height={"100%"} display={"flex"}>
      <ChatroomContent
        onSend={(msg) => {
          sendMessage(msg);
        }}
        messages={reshaped_messages}
      />
    </Stack>
  );
}

function Involved(props: { project_id: number }) {
  const { project_id } = props;
  const [connected, setConnected] = useState(false);
  const [activeRoom, setActiveRoom] = useState<number | "index" | false>(false);
  const { data: sessionData } = useSession();
  const { data: chatrooms } = useChatroomByProjectId(project_id);
  const { data: project_data } = useProjectDetail(project_id.toString());
  const user_id = sessionData?.logged ? sessionData.user_id : undefined;

  useEffect(() => {
    if (!chatrooms) {
      setActiveRoom(false);
      return;
    }
    if (activeRoom === false || activeRoom === "index") {
      return;
    }
    const found = chatrooms.map((x) => x.chatroom_id).includes(activeRoom);
    if (!found) {
      setActiveRoom(false);
    }
  }, [chatrooms]);

  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [addRoomName, setAddRoomName] = useState("");

  const { mutate: createRoom } = useCreateProjectRoom(addRoomName, project_id, () => {
    enqueueSnackbar({
      message: <Typography>Room created!</Typography>,
      variant: "success",
    });
    setAddRoomOpen(false);
  });

  const { mutate: leaveProject } = useLeaveProject(project_data?.project_id, user_id, (x) => {
    enqueueSnackbar({
      variant: "success",
      message: <Typography>{x.msg}</Typography>,
    });
  });

  useChatSocket({
    userId: sessionData?.logged ? sessionData.user_id : undefined,
    onConnect: () => {
      setConnected(true);
    },
    onDisconnect: () => {
      setConnected(false);
    },
  });

  if (!sessionData?.logged) {
    return null;
  }

  return (
    <Grid container height={"100%"}>
      <Snackbar open={!connected}>
        <Alert severity="error">
          <Typography>You are not connected!</Typography>
        </Alert>
      </Snackbar>
      <Dialog open={addRoomOpen} onClose={() => setAddRoomOpen(false)}>
        <DialogTitle>Add new room</DialogTitle>
        <DialogContent>
          <TextField fullWidth onChange={(e) => setAddRoomName(e.target.value)} label="Room name" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => createRoom()}>Create room</Button>
        </DialogActions>
      </Dialog>
      <Grid item xs={2} lg={1}>
        <Tabs
          orientation="vertical"
          value={activeRoom}
          onChange={(_e, newRoomId) => {
            setActiveRoom(newRoomId);
          }}
        >
          <Tab label={"Index"} value="index" />
          {chatrooms?.map((x, i) => (
            <Tab key={i} label={x.chatroom_name} value={x.chatroom_id} />
          ))}
        </Tabs>
        <Button
          onClick={() => {
            setAddRoomOpen(true);
          }}
        >
          Add room
        </Button>
      </Grid>
      <Grid item xs={10} lg={11}>
        {activeRoom === "index" && project_data && (
          <>
            <Button onClick={() => leaveProject()}>Leave</Button>
            <ProjectIndex
              org_id={project_data.org_id}
              project_categories={project_data.project_categories}
              project_desc={project_data.project_desc}
              project_devs={project_data.project_devs}
            />
          </>
        )}
        {chatrooms?.map(
          (x, i) =>
            activeRoom === x.chatroom_id && <Chatroom key={i} chatroom_id={x.chatroom_id} />,
        )}
      </Grid>
    </Grid>
  );
}

function ProjectIndex(props: {
  project_desc: string;
  org_id: number;
  project_devs: { name: string }[];
  project_categories: string[];
}) {
  const { project_desc, org_id, project_devs, project_categories } = props;
  return (
    <>
      <Grid item xs={12}>
        <Typography>{project_desc}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography>{org_id}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" fontWeight={"bold"}>
          Collaborators
        </Typography>
        <Stack>
          {project_devs.map((x) => (
            <Box>
              <Typography>{x.name}</Typography>
            </Box>
          ))}
        </Stack>
      </Grid>
      <Grid item xs={12}>
        <Typography>Categories</Typography>
        <Grid container spacing={1}>
          {project_categories.map((category, index) => (
            <Grid item key={index}>
              <Chip label={category} />
            </Grid>
          ))}
        </Grid>
      </Grid>
    </>
  );
}

function ProjectDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  if (id === undefined) {
    setLocation("/projects");
  }

  const { data: user_data } = useSession();
  const user_id = user_data?.logged ? user_data.user_id : undefined;

  const { data: project_data } = useProjectDetail(id!, (failureCount, error) => {
    if (error instanceof APIError || failureCount > 3) {
      setLocation("/projects");
      return false;
    }
    return true;
  });

  const { data: membership } = useProjectMembership(project_data?.project_id, user_id);

  const { mutate: addMember } = useAddProjectMember(project_data?.project_id, user_id, (x) => {
    enqueueSnackbar({
      variant: "success",
      message: <Typography>{x.msg}</Typography>,
    });
  });

  if (!project_data || !membership) {
    return <Skeleton />;
  }

  if (membership.status === "Not Involved") {
    return (
      <Grid container mt={2}>
        <Grid item xs={1}>
          <Link to={"/projects"}>
            <Button startIcon={<ArrowBack />} variant="contained" fullWidth>
              Go Back
            </Button>
          </Link>
        </Grid>
        <Grid item xs={10}>
          <Typography variant="h4" fontWeight={"bold"} align="center">
            {project_data.project_name}
          </Typography>
        </Grid>
        <Grid item xs={1}>
          <Button endIcon={<Check />} variant="contained" fullWidth onClick={() => addMember()}>
            Apply
          </Button>
        </Grid>
        <ProjectIndex
          org_id={project_data.org_id}
          project_categories={project_data.project_categories}
          project_desc={project_data.project_desc}
          project_devs={project_data.project_devs}
        />
      </Grid>
    );
  } else {
    return <Involved project_id={project_data.project_id} />;
  }
}

export default ProjectDetailPage;
