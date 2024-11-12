import { ArrowLeft, ArrowRight, MoreVert } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  Menu,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import { Fragment, useState } from "react";
import { Redirect } from "wouter";
import ChatroomComponent from "../components/Chatroom/Chatroom.tsx";
import {
  AddMembersDialog,
  ChangeNameDialog,
  LeaveRoom,
} from "../components/Chatroom/ChatroomMisc.tsx";
import ChatroomSidebar from "../components/Chatroom/ChatroomSidebar.tsx";
import { useSearchParams, useStateSearch } from "../helpers/search.ts";
import {
  useChatSocket,
  useUsersDetailChatroomsGet,
  useUsersDetailChatroomsPost,
} from "../queries/chat_hooks.ts";
import { useSessionGet } from "../queries/sesssion_hooks.ts";

function AddRoomDialog(props: { user_id: number }) {
  const { user_id } = props;

  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [addRoomName, setAddRoomName] = useState("");
  const { mutate: createRoom } = useUsersDetailChatroomsPost({
    user_id: user_id,
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
              fullWidth
              onChange={(e) => setAddRoomName(e.target.value)}
              label="Nama Ruangan"
              required
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

function ChatroomPageAuthorized(props: { user_id: number }) {
  const { user_id } = props;
  const searchHook = useSearchParams();

  let activeRoom: false | number = false;

  const [activeRoomRaw, setActiveRoom] = useStateSearch("room", searchHook);
  const tryNumber = Number(activeRoomRaw);
  if (!Number.isNaN(tryNumber)) {
    activeRoom = tryNumber;
  }

  const [connected, setConnected] = useState(false);

  const { data: chatrooms } = useUsersDetailChatroomsGet({
    user_id: user_id,
  });

  const selectedChatroom = chatrooms?.find((x) => x.chatroom_id === activeRoom);

  if (activeRoom != undefined && chatrooms && selectedChatroom === undefined) {
    setActiveRoom(undefined);
  }

  useChatSocket({
    userId: user_id,
    onConnect: () => {
      setConnected(true);
    },
    onDisconnect: () => {
      setConnected(false);
    },
  });

  const [sideOpen, setSideOpen] = useState(false);

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | undefined>();

  return (
    <Grid container minHeight={"inherit"} height={2} spacing={1}>
      <Snackbar open={!connected}>
        <Alert severity="error">
          <Typography>Koneksi chat terputus!</Typography>
        </Alert>
      </Snackbar>
      {sideOpen || selectedChatroom == undefined ? (
        <Grid
          size={{
            xs: 4,
            lg: 2,
          }}
          sx={{
            overflow: "scroll",
            height: "100%",
            paddingRight: 2,
          }}
        >
          <AddRoomDialog user_id={user_id} />
          <List>
            {chatrooms?.map((x) => {
              return (
                <Fragment key={x.chatroom_id}>
                  <Divider />
                  <ChatroomSidebar
                    chatroom_id={x.chatroom_id}
                    user_id={user_id}
                    selected={x.chatroom_id === activeRoom}
                    onClick={() => {
                      setActiveRoom(x.chatroom_id);
                    }}
                  />
                </Fragment>
              );
            })}
          </List>
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
                  <AddMembersDialog chatroom_id={selectedChatroom.chatroom_id} />
                  <ChangeNameDialog chatroom_id={selectedChatroom.chatroom_id} />
                  <LeaveRoom
                    chatroom_id={selectedChatroom.chatroom_id}
                    user_id={user_id}
                    onLeave={() => {
                      setActiveRoom(undefined);
                      setMenuAnchor(undefined);
                    }}
                  />
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
  );
}

function ChatroomPage() {
  const { data: sessionData } = useSessionGet();

  if (!sessionData) {
    return <Skeleton />;
  }

  if (sessionData.logged === false) {
    return <Redirect to={"/"} />;
  } else {
    return <ChatroomPageAuthorized user_id={sessionData.user_id} />;
  }
}

export default ChatroomPage;
