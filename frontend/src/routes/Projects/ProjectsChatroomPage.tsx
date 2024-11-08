import { ArrowLeft, ArrowRight, MoreVert } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useParams } from "wouter";
import ChatroomComponent from "../../components/Chatroom/Chatroom.tsx";
import { ChangeNameDialog, DeleteRoom } from "../../components/Chatroom/ChatroomMisc.tsx";
import { useSearchParams, useStateSearch } from "../../helpers/search.ts";
import {
  useChatSocket,
  useProjectsDetailChatroomsGet,
  useProjectsDetailChatroomsPost,
} from "../../queries/chat_hooks.ts";
import { useSessionGet } from "../../queries/sesssion_hooks.ts";
import AuthorizeProjects, { RedirectBack } from "./components/AuthorizeProjects.tsx";

function CreateProjectChatroomDialog(props: { project_id: number }) {
  const { project_id } = props;
  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [addRoomName, setAddRoomName] = useState("");
  const { mutate: createRoom } = useProjectsDetailChatroomsPost({
    project_id,
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Ruang chat berhasil dibuat!</Typography>,
        variant: "success",
      });
      reset();
    },
  });

  function reset() {
    setAddRoomName("");
    setAddRoomOpen(false);
  }

  return (
    <>
      <Dialog open={addRoomOpen} onClose={() => reset()}>
        <DialogTitle>Tambah ruangan baru</DialogTitle>
        <DialogContent>
          <Box pt={2}>
            <TextField
              required
              value={addRoomName ?? ""}
              fullWidth
              onChange={(e) => setAddRoomName(e.target.value)}
              label="Nama Ruangan"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              createRoom({
                name: addRoomName,
              })
            }
          >
            Buat ruangan
          </Button>
        </DialogActions>
      </Dialog>
      <Button
        fullWidth
        variant="contained"
        onClick={() => {
          setAddRoomOpen(true);
        }}
      >
        Tambah Ruangan
      </Button>
    </>
  );
}

function ChatroomWrapper(props: { user_id: number; project_id: number }) {
  const { project_id, user_id } = props;
  const [connected, setConnected] = useState(false);

  const searchHook = useSearchParams();

  let activeRoom: false | number = false;

  const [activeRoomRaw, setActiveRoom] = useStateSearch("room", searchHook);
  const tryNumber = Number(activeRoomRaw);
  if (!Number.isNaN(tryNumber)) {
    activeRoom = tryNumber;
  }

  const { data: chatrooms } = useProjectsDetailChatroomsGet({ project_id });
  const selectedChatroom = chatrooms?.find((x) => x.chatroom_id === activeRoom);

  const [sideOpen, setSideOpen] = useState(false);

  useChatSocket({
    userId: user_id,
    onConnect: () => {
      setConnected(true);
    },
    onDisconnect: () => {
      setConnected(false);
    },
  });
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | undefined>();

  return (
    <Box minHeight={"inherit"}>
      <Snackbar open={!connected}>
        <Alert severity="error">
          <Typography>Koneksi chat terputus!</Typography>
        </Alert>
      </Snackbar>
      <Grid container minHeight={"inherit"} spacing={1}>
        {sideOpen || selectedChatroom == undefined ? (
          <Grid
            size={{
              xs: 4,
              lg: 2,
            }}
          >
            <CreateProjectChatroomDialog project_id={project_id} />
            <Tabs
              orientation="vertical"
              scrollButtons="auto"
              allowScrollButtonsMobile
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
        ) : null}
        <Grid
          size={{
            xs: sideOpen ? 8 : 12,
            lg: sideOpen ? 10 : 12,
          }}
        >
          {selectedChatroom && (
            <Stack height={"100%"} display={"flex"}>
              <Paper>
                <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
                  {sideOpen ? (
                    <IconButton variant="outlined" onClick={() => setSideOpen(() => false)}>
                      <ArrowLeft />
                    </IconButton>
                  ) : (
                    <IconButton variant="outlined" onClick={() => setSideOpen(() => true)}>
                      <ArrowRight />
                    </IconButton>
                  )}
                  <Typography
                    variant="h5"
                    fontWeight={"bold"}
                    my={1}
                    mx={2}
                    overflow={"hidden"}
                    sx={{
                      wordWrap: "break-word",
                    }}
                  >
                    {selectedChatroom.chatroom_name}
                  </Typography>
                  <Menu
                    open={menuAnchor != undefined}
                    anchorEl={menuAnchor}
                    onClose={() => setMenuAnchor(undefined)}
                  >
                    <DeleteRoom
                      chatroom_id={selectedChatroom.chatroom_id}
                      onLeave={() => {
                        setActiveRoom(false);
                        setMenuAnchor(undefined);
                      }}
                    />
                    <ChangeNameDialog chatroom_id={selectedChatroom.chatroom_id} />
                  </Menu>
                  <IconButton variant="outlined" onClick={(e) => setMenuAnchor(e.currentTarget)}>
                    <MoreVert />
                  </IconButton>
                </Stack>
              </Paper>
              <ChatroomComponent chatroom_id={selectedChatroom.chatroom_id} />
            </Stack>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

function ProjectsChatroomPage() {
  const { project_id: id } = useParams();
  const project_id = Number(id);

  const { data: user_data } = useSessionGet();

  if (!user_data) {
    return <Skeleton />;
  }

  if (!user_data.logged) {
    return <RedirectBack />;
  }

  return (
    <AuthorizeProjects allowedRoles={["Admin", "Dev"]}>
      <ChatroomWrapper project_id={project_id} user_id={user_data.user_id} />
    </AuthorizeProjects>
  );
}

export default ProjectsChatroomPage;
