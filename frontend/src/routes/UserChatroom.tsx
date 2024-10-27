import { ArrowLeft, ArrowRight, MoreVert } from "@mui/icons-material";
import {
  Alert,
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
import { Redirect } from "wouter";
import ChatroomComponent from "../components/Chatroom/Chatroom.tsx";
import {
  AddMembersDialog,
  ChangeNameDialog,
  LeaveRoom,
} from "../components/Chatroom/ChatroomMisc.tsx";
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
        message: <Typography>Room created!</Typography>,
        variant: "success",
      });
      setAddRoomOpen(false);
    },
  });
  return (
    <>
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
      <Button
        fullWidth
        variant="contained"
        onClick={() => {
          setAddRoomOpen(true);
        }}
      >
        Add room
      </Button>
    </>
  );
}

function ChatroomPageAuthorized(props: { user_id: number }) {
  const { user_id } = props;
  const searchHook = useSearchParams();

  let activeRoom: undefined | number = undefined;

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
    <Grid container minHeight={"inherit"} spacing={1}>
      <Snackbar open={!connected}>
        <Alert severity="error">
          <Typography>You are not connected!</Typography>
        </Alert>
      </Snackbar>
      {sideOpen || selectedChatroom == undefined ? (
        <Grid
          size={{
            xs: 4,
            lg: 2,
          }}
        >
          <AddRoomDialog user_id={user_id} />
          <Tabs
            variant="scrollable"
            scrollButtons="auto"
            orientation="vertical"
            allowScrollButtonsMobile
            value={activeRoom}
            onChange={(_e, newRoomId) => {
              setActiveRoom(newRoomId);
            }}
          >
            {chatrooms?.map((x, i) => (
              <Tab key={i} label={x.chatroom_name} wrapped value={x.chatroom_id} />
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
