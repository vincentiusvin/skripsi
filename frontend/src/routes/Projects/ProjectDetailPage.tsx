import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { Add, ArrowBack, Check, Logout } from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { enqueueSnackbar } from "notistack";
import { Fragment, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { API } from "../../../../backend/src/routes.ts";
import {
  useChatSocket,
  useChatroomsDetailGet,
  useChatroomsDetailMessagesGet,
  useChatroomsDetailMessagesPost,
  useProjectsDetailChatroomsGet,
  useProjectsDetailChatroomsPost,
} from "../../queries/chat_hooks";
import {
  useProjectsDetailBucketsGet,
  useProjectsDetailBucketsPost,
  useProjectsDetailGet,
  useProjectsDetailMembersDelete,
  useProjectsDetailMembersGet,
  useProjectsDetailMembersPut,
  useProjectsDetailMembersPutVariableID,
} from "../../queries/project_hooks";
import { useSessionGet } from "../../queries/sesssion_hooks.ts";
import {
  useBucketsDetailTasksGet,
  useBucketsDetailTasksPost,
  useTasksDetailPut,
} from "../../queries/task_hooks.ts";
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

function Task(props: {
  task_id: number;
  name: string;
  description?: string;
  start_at?: Dayjs;
  end_at?: Dayjs;
}) {
  const { task_id, name, description, start_at, end_at } = props;
  const {
    attributes,
    listeners,
    setNodeRef: draggableRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `task-${task_id}`,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <Card
      variant="elevation"
      style={style}
      {...listeners}
      {...attributes}
      ref={draggableRef}
      sx={{
        zIndex: isDragging ? 3 : 2,
      }}
    >
      <CardActionArea>
        <CardHeader
          title={
            <Typography variant="h5" fontWeight={"bold"}>
              {name}
            </Typography>
          }
          subheader={<Typography variant="body1">{description}</Typography>}
        />
        <CardContent>
          {start_at && (
            <>
              <Typography variant="caption">Mulai: {start_at.format("ddd, DD/MM/YY")}</Typography>
              <br />
            </>
          )}
          {end_at && (
            <Typography variant="caption">Berakhir: {end_at.format("ddd, DD/MM/YY")}</Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function Bucket(props: {
  bucket_id: number;
  name: string;
  setSelectedBucketEdit: (x: number) => void;
  outline?: boolean;
}) {
  const { bucket_id, name, setSelectedBucketEdit, outline } = props;
  const { data: tasks } = useBucketsDetailTasksGet({ bucket_id });
  const { setNodeRef: droppableRef, isOver } = useDroppable({
    id: `bucket-${bucket_id}`,
  });

  return (
    <Box
      ref={droppableRef}
      position={"relative"}
      sx={{
        transitionDuration: "100ms",
        border: 3,
        borderStyle: "dashed",
        borderColor: outline ? (isOver ? "green" : "white") : "transparent",
      }}
    >
      {name}
      <Button onClick={() => setSelectedBucketEdit(bucket_id)}>
        <Add />
      </Button>
      <Stack spacing={5} width={"250px"} height={1}>
        {tasks?.map((x, i) => (
          <Task
            key={i}
            task_id={x.id}
            name={x.name}
            description={x.description ?? undefined}
            start_at={x.start_at ? dayjs(x.start_at) : undefined}
            end_at={x.end_at ? dayjs(x.end_at) : undefined}
          />
        ))}
      </Stack>
    </Box>
  );
}

function Tasks(props: { project_id: number }) {
  const { project_id } = props;
  const { data: buckets } = useProjectsDetailBucketsGet({ project_id });
  const { mutate: addBucket } = useProjectsDetailBucketsPost({
    project_id: project_id,
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Task created!</Typography>,
        variant: "success",
      });
    },
  });
  const { mutate: addTask } = useBucketsDetailTasksPost({
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Task created!</Typography>,
        variant: "success",
      });
      setSelectedBucketEdit(null);
    },
  });
  const [bucketName, setBucketName] = useState("");

  // undef: gak ada yang dipilih
  // number: lagi ngedit bucket itu
  const [selectedBucketEdit, setSelectedBucketEdit] = useState<null | number>(null);
  const [taskName, setTaskName] = useState<null | string>(null);
  const [taskDescription, setTaskDescription] = useState<null | string>(null);
  const [taskStartAt, setTaskStartAt] = useState<null | Dayjs>(null);
  const [taskEndAt, setTaskEndAt] = useState<null | Dayjs>(null);

  const { mutate: updateTask } = useTasksDetailPut({});

  const [dragging, setDragging] = useState(false);

  return (
    <Stack height={"100%"}>
      {selectedBucketEdit && (
        <Dialog open={selectedBucketEdit != null} onClose={() => setSelectedBucketEdit(null)}>
          <DialogTitle>Add new task</DialogTitle>
          <DialogContent>
            <TextField fullWidth onChange={(e) => setTaskName(e.target.value)} label="Task name" />
            <TextField
              fullWidth
              onChange={(e) => setTaskDescription(e.target.value)}
              label="Task description"
            />
            <DatePicker onAccept={(x) => setTaskStartAt(x)} label="Start At"></DatePicker>
            <DatePicker onAccept={(x) => setTaskEndAt(x)} label="End At"></DatePicker>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                if (taskName == null) {
                  return;
                }
                addTask({
                  name: taskName,
                  bucket_id: selectedBucketEdit,
                  description: taskDescription ?? undefined,
                  start_at: taskStartAt?.toDate(),
                  end_at: taskEndAt?.toDate(),
                });
              }}
            >
              Create Task
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <TextField value={bucketName} onChange={(e) => setBucketName(e.target.value)}></TextField>
      <Button onClick={() => addBucket({ name: bucketName })}>Add Bucket</Button>
      <Stack direction={"row"} spacing={5} flexGrow={1} pb={8}>
        <DndContext
          onDragStart={() => {
            setDragging(true);
          }}
          onDragCancel={() => {
            setDragging(false);
          }}
          onDragEnd={(x) => {
            setDragging(false);
            const [, dropped_bucket_id] = x.over?.id.toString().split("-") || [];
            const [, dragged_task_id] = x.active?.id.toString().split("-") || [];
            if (dropped_bucket_id == undefined || dragged_task_id == undefined) {
              return;
            }

            const bucket_id = Number(dropped_bucket_id);
            const task_id = Number(dragged_task_id);

            if (Number.isNaN(bucket_id) || Number.isNaN(task_id)) {
              return;
            }

            updateTask({
              task_id: task_id,
              bucket_id: bucket_id,
            });
          }}
        >
          {buckets?.map((x, i) => (
            <Bucket
              outline={dragging}
              bucket_id={x.id}
              name={x.name}
              setSelectedBucketEdit={(x) => setSelectedBucketEdit(x)}
              key={i}
            ></Bucket>
          ))}
        </DndContext>
      </Stack>
    </Stack>
  );
}

function InvolvedView(props: { project_id: number; user_id: number; role: MemberRoles }) {
  const { project_id, user_id, role } = props;
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<"disc" | "info" | "manage" | "tasks">("disc");
  const [activeRoom, setActiveRoom] = useState<number | false>(false);
  const { data: chatrooms } = useProjectsDetailChatroomsGet({ project_id });
  const { data: project } = useProjectsDetailGet({ project_id });

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

  const { mutate: putMember } = useProjectsDetailMembersPutVariableID({
    project_id: project_id,
    onSuccess: (x) => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>User berhasil ditambahkan sebagai {x.role}!</Typography>,
      });
    },
  });

  if (!project) {
    return <Skeleton />;
  }

  const selectedChatroom = chatrooms?.find((x) => x.chatroom_id === activeRoom);

  return (
    <Stack height={"100%"}>
      <Grid container>
        <Grid item xs={1}>
          <Typography variant="h3" fontWeight={"bold"}>
            {project.project_name}
          </Typography>
        </Grid>
        <Grid item xs={10}>
          <Tabs
            centered
            sx={{
              flexGrow: 1,
            }}
            value={activeTab}
            onChange={(_e, newRoomId) => {
              setActiveTab(newRoomId);
            }}
          >
            <Tab label={"Discussion"} value="disc" />
            <Tab label={"Tasks"} value="tasks" />
            <Tab label={"Info"} value="info" />
            {role === "Admin" && <Tab label={"Manage"} value="manage" />}
          </Tabs>
        </Grid>
        <Grid item xs={1}>
          <Button endIcon={<Logout />} onClick={() => leaveProject()} variant="contained">
            Leave
          </Button>
        </Grid>
      </Grid>
      {activeTab === "disc" && (
        <>
          <Snackbar open={!connected}>
            <Alert severity="error">
              <Typography>You are not connected!</Typography>
            </Alert>
          </Snackbar>
          <Dialog open={addRoomOpen} onClose={() => setAddRoomOpen(false)}>
            <DialogTitle>Add new room</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                onChange={(e) => setAddRoomName(e.target.value)}
                label="Room name"
              />
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
          <Grid container height={"100%"}>
            <Grid item xs={2} lg={1}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  setAddRoomOpen(true);
                }}
              >
                Add room
              </Button>
              <Tabs
                orientation="vertical"
                value={activeRoom}
                onChange={(_e, newRoomId) => {
                  setActiveRoom(newRoomId);
                }}
              >
                {chatrooms?.map((x, i) => (
                  <Tab key={i} label={x.chatroom_name} value={x.chatroom_id} />
                ))}
              </Tabs>
            </Grid>
            <Grid item xs={10} lg={11}>
              {selectedChatroom && <Chatroom chatroom_id={selectedChatroom.chatroom_id} />}
            </Grid>
          </Grid>
        </>
      )}
      {activeTab === "info" && (
        <Stack gap={2}>
          <Box textAlign={"center"}>
            <Typography variant="h5" fontWeight="bold">
              Project Description
            </Typography>
            <Typography>{project.project_desc}</Typography>
          </Box>
          <Box textAlign={"center"}>
            <Typography variant="h5" fontWeight="bold">
              Organization
            </Typography>
            <Typography>{project.org_id}</Typography>
          </Box>
          <Box textAlign={"center"}>
            <Typography variant="h5" fontWeight={"bold"} mb={1}>
              Categories
            </Typography>
            <Stack direction={"row"} justifyContent={"center"} spacing={2}>
              {project.project_categories.map((category, index) => (
                <Chip key={index} label={category} />
              ))}
            </Stack>
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={"bold"} textAlign={"center"} mb={1}>
              Collaborators
            </Typography>
            <Grid container width={"75%"} margin={"0 auto"} spacing={2}>
              {project.project_members
                .filter((x) => x.role !== "Pending")
                .map((x, i) => (
                  <Fragment key={i}>
                    <Grid item xs={2} lg={0.75}>
                      <Avatar />
                    </Grid>
                    <Grid item xs={4} lg={2.25}>
                      <Typography>{x.name}</Typography>
                      <Typography variant="body2" color={"GrayText"}>
                        {x.role}
                      </Typography>
                    </Grid>
                  </Fragment>
                ))}
            </Grid>
          </Box>
        </Stack>
      )}
      {activeTab === "manage" && (
        <Grid container width={"85%"} margin={"0 auto"} mt={2} spacing={2} columnSpacing={4}>
          {project.project_members
            .filter((x) => x.role === "Pending")
            .map((x, i) => (
              <Grid item xs={3} key={i} justifyContent={"center"}>
                <Paper
                  sx={{
                    padding: 2,
                    borderRadius: 2,
                  }}
                >
                  <Stack direction={"row"} spacing={2} justifyContent={"center"}>
                    <Avatar />
                    <Box flexGrow={1}>
                      <Typography>{x.name}</Typography>
                      <Typography variant="body2" color={"GrayText"}>
                        {x.role}
                      </Typography>
                    </Box>
                    <Button
                      onClick={() => {
                        putMember({
                          role: "Dev",
                          user_id: x.id,
                        });
                      }}
                    >
                      Approve
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            ))}
        </Grid>
      )}
      {activeTab === "tasks" && <Tasks project_id={project_id} />}
    </Stack>
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
    <Grid container mt={2} rowSpacing={2}>
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
        <Stack gap={2}>
          <Box textAlign={"center"}>
            <Typography variant="h5" fontWeight="bold">
              Project Description
            </Typography>
            <Typography>{project.project_desc}</Typography>
          </Box>
          <Box textAlign={"center"}>
            <Typography variant="h5" fontWeight="bold">
              Organization
            </Typography>
            <Typography>{project.org_id}</Typography>
          </Box>
          <Box textAlign={"center"}>
            <Typography variant="h5" fontWeight={"bold"} mb={1}>
              Categories
            </Typography>
            <Stack direction={"row"} justifyContent={"center"} spacing={2}>
              {project.project_categories.map((category, index) => (
                <Chip key={index} label={category} />
              ))}
            </Stack>
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={"bold"} textAlign={"center"} mb={1}>
              Collaborators
            </Typography>
            <Grid container width={"85%"} margin={"0 auto"}>
              {project.project_members
                .filter((x) => x.role !== "Pending")
                .map((x, i) => (
                  <Grid item xs={3} key={i} justifyContent={"center"}>
                    <Stack direction={"row"} spacing={2} justifyContent={"center"}>
                      <Avatar />
                      <Box>
                        <Typography>{x.name}</Typography>
                        <Typography variant="body2" color={"GrayText"}>
                          {x.role}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                ))}
            </Grid>
          </Box>
        </Stack>
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

  const { data: membership } = useProjectsDetailMembersGet({
    project_id: project_id,
    user_id: user_id,
  });

  const role = membership?.role;

  if (!role || !user_id) {
    return <Skeleton />;
  }

  if (role === "Not Involved" || role === "Pending") {
    return <UninvolvedView project_id={project_id} user_id={user_id} role={role} />;
  } else {
    return <InvolvedView project_id={project_id} user_id={user_id} role={role} />;
  }
}

export default ProjectDetailPage;
