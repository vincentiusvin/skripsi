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
import { API } from "../../../../backend/src/routes.ts";
import { APIError } from "../../helpers/fetch";
import {
  useChatSocket,
  useChatroomsDetailGet,
  useChatroomsDetailMessagesGet,
  useChatroomsDetailMessagesPost,
  useProjectsDetailChatroomsGet,
  useProjectsDetailChatroomsPost,
} from "../../queries/chat_hooks";
import {
  useProjectsDetailGet,
  useProjectsDetailMembersDelete,
  useProjectsDetailMembersGet,
  useProjectsDetailMembersPut,
} from "../../queries/project_hooks";
import { useSessionGet } from "../../queries/sesssion_hooks";
import { useUsersGet } from "../../queries/user_hooks";
import { ChatroomContent } from "../Chatroom";

function Chatroom(props: { chatroom_id: number }) {
  const { chatroom_id } = props;
  const { data: chatroom } = useChatroomsDetailGet({ chatroom_id });
  const { data: messages } = useChatroomsDetailMessagesGet({ chatroom_id });
  const { data: users } = useUsersGet();
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

  const { mutate: sendMessage } = useChatroomsDetailMessagesPost({ chatroom_id });

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

type MemberRoles = API["ProjectsDetailMembersGet"]["ResBody"]["role"] | "Not Involved";

function InvolvedView(props: { project_id: number; user_id: number }) {
  const { project_id, user_id } = props;
  const [connected, setConnected] = useState(false);
  const [activeRoom, setActiveRoom] = useState<number | "index" | false>(false);
  const { data: chatrooms } = useProjectsDetailChatroomsGet({ project_id });
  const { data: project } = useProjectsDetailGet({ project_id });

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

  const { mutate: createRoom } = useProjectsDetailChatroomsPost({
    project_id: project_id,
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Room created!</Typography>,
        variant: "success",
      });
      setAddRoomOpen(false);
    },
  });

  const { mutate: leaveProject } = useProjectsDetailMembersDelete({
    project_id: project_id,
    user_id: user_id,
    onSuccess: (x) => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>{x.msg}</Typography>,
      });
    },
  });

  useChatSocket({
    userId: user_id,
    onConnect: () => {
      setConnected(true);
    },
    onDisconnect: () => {
      setConnected(false);
    },
  });

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
          <Button
            onClick={() =>
              createRoom({
                name: addRoomName,
              })
            }
          >
            Create room
          </Button>
        </DialogActions>
      </Dialog>
      <Grid item xs={2} lg={1}>
        <Tabs
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
        {activeRoom === "index" && project && (
          <>
            <Button onClick={() => leaveProject()}>Leave</Button>
            <Grid item xs={12}>
              <Typography>{project.project_desc}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography>{project.org_id}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight={"bold"}>
                Collaborators
              </Typography>
              <Stack>
                {project.project_members.map((x, i) => (
                  <Box key={i}>
                    <Typography>{x.name}</Typography>
                  </Box>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Typography>Categories</Typography>
              <Grid container spacing={1}>
                {project.project_categories.map((category, index) => (
                  <Grid item key={index}>
                    <Chip label={category} />
                  </Grid>
                ))}
              </Grid>
            </Grid>
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

function UninvolvedView(props: { project_id: number; user_id: number; role: MemberRoles }) {
  const { project_id, user_id, role } = props;

  const { data: project } = useProjectsDetailGet({
    project_id: project_id,
  });

  const { mutate: addMember } = useProjectsDetailMembersPut({
    project_id: project_id,
    user_id: user_id,
    onSuccess: (x) => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>Status anda "{x.role}"</Typography>,
      });
    },
  });

  if (!project) {
    return <Skeleton />;
  }

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
          {project.project_name}
        </Typography>
      </Grid>
      <Grid item xs={1}>
        <Button
          endIcon={<Check />}
          variant="contained"
          disabled={role !== "Not Involved"}
          fullWidth
          onClick={() =>
            addMember({
              role: "Pending",
            })
          }
        >
          {role !== "Not Involved" ? "Applied" : "Apply"}
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Typography>{project.project_desc}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography>{project.org_id}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" fontWeight={"bold"}>
          Collaborators
        </Typography>
        <Stack>
          {project.project_members.map((x, i) => (
            <Box key={i}>
              <Typography>{x.name}</Typography>
            </Box>
          ))}
        </Stack>
      </Grid>
      <Grid item xs={12}>
        <Typography>Categories</Typography>
        <Grid container spacing={1}>
          {project.project_categories.map((category, index) => (
            <Grid item key={index}>
              <Chip label={category} />
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
}

function ProjectDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  if (id === undefined) {
    setLocation("/projects");
  }
  const project_id = Number(id);

  const { data: user_data } = useSessionGet();
  const user_id = user_data?.logged ? user_data.user_id : undefined;

  const { data: membership, error: membershipError } = useProjectsDetailMembersGet({
    project_id: project_id,
    user_id: user_id,
  });

  let role: NonNullable<typeof membership>["role"] | "Not Involved" | undefined;
  if (membershipError instanceof APIError && membershipError.status === 404) {
    role = "Not Involved";
  } else if (membership) {
    role = membership.role;
  }

  if (!role || !user_id) {
    return <Skeleton />;
  }

  if (role === "Not Involved" || role === "Pending") {
    return <UninvolvedView project_id={project_id} user_id={user_id} role={role} />;
  } else {
    return <InvolvedView project_id={project_id} user_id={user_id} />;
  }
}

export default ProjectDetailPage;
