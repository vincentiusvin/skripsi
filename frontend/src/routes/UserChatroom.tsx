import { Add, Edit, Logout, People, Remove } from "@mui/icons-material";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
import { enqueueSnackbar } from "notistack";
import React, { useState } from "react";
import { Redirect } from "wouter";
import ChatroomComponent from "../components/Chatroom.tsx";
import {
  useChatSocket,
  useChatroomsDetailGet,
  useChatroomsDetailPut,
  useUsersDetailChatroomsGet,
  useUsersDetailChatroomsPost,
} from "../queries/chat_hooks.ts";
import { useSessionGet } from "../queries/sesssion_hooks.ts";
import { useUsersGet } from "../queries/user_hooks.ts";

function ChatroomHeader(props: {
  chatroom_name: string;
  chatroom_users: number[];
  onEditName: (name: string) => void;
  onEditMembers: (members: number[]) => void;
  onLeave: () => void;
}) {
  const { chatroom_name, chatroom_users, onEditName, onEditMembers, onLeave } = props;

  const { data: users } = useUsersGet();

  const [editRoomNameOpen, setEditRoomNameOpen] = useState(false);
  const [editRoomMembersOpen, setEditRoomMembersOpen] = useState(false);
  const [editRoomName, setEditRoomName] = useState(chatroom_name);
  const [editRoomMembers, setEditRoomMembers] = useState<number[]>(chatroom_users);

  const inUsers: typeof users & [] = [];
  const pendingUsers: typeof users & [] = [];
  const outUsers: typeof users & [] = [];

  users?.forEach((x) => {
    if (chatroom_users.includes(x.user_id)) {
      inUsers.push(x);
    } else if (editRoomMembers.includes(x.user_id)) {
      pendingUsers.push(x);
    } else {
      outUsers.push(x);
    }
  });

  return (
    <>
      <Dialog open={editRoomNameOpen} onClose={() => setEditRoomNameOpen(false)}>
        <DialogTitle>Rename room</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={editRoomName}
            onChange={(e) => setEditRoomName(e.target.value)}
            label="Room name"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              onEditName(editRoomName);
              setEditRoomNameOpen(false);
            }}
          >
            Rename Room
          </Button>
        </DialogActions>
      </Dialog>
      {users && (
        <Dialog open={editRoomMembersOpen} onClose={() => setEditRoomMembersOpen(false)}>
          <DialogTitle>Add members</DialogTitle>
          <DialogContent
            sx={{
              minWidth: 350,
            }}
          >
            <Typography fontWeight={"bold"} variant="h6">
              Chat members:
            </Typography>
            {inUsers.map((x, i) => (
              <Typography key={i}>{x.user_name}</Typography>
            ))}
            <Divider
              sx={{
                my: 2,
              }}
            />
            <Typography fontWeight={"bold"} variant="h6">
              Could be invited:
            </Typography>
            <Grid container>
              {outUsers.map((x, i) => (
                <React.Fragment key={i}>
                  <Grid item key={i} xs={10}>
                    <Typography>{x.user_name}</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Button onClick={() => setEditRoomMembers((old) => [...old, x.user_id])}>
                      <Add />
                    </Button>
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>

            {!!pendingUsers.length && (
              <>
                <Divider
                  sx={{
                    my: 2,
                  }}
                />
                <Typography fontWeight={"bold"} variant="h6">
                  Pending invite:
                </Typography>
                <Grid container>
                  {pendingUsers.map((x, i) => (
                    <React.Fragment key={i}>
                      <Grid item key={i} xs={10}>
                        <Typography>{x.user_name}</Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Button
                          onClick={() =>
                            setEditRoomMembers((old) =>
                              old.filter((old_num) => old_num !== x.user_id),
                            )
                          }
                        >
                          <Remove />
                        </Button>
                      </Grid>
                    </React.Fragment>
                  ))}
                </Grid>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                onEditMembers(editRoomMembers);
                setEditRoomMembersOpen(false);
              }}
            >
              Save members
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <Paper>
        <Stack direction={"row"} justifyContent={"space-between"}>
          <Typography variant="h5" fontWeight={"bold"} my={1}>
            {chatroom_name}
          </Typography>
          <Stack direction={"row"} spacing={2}>
            <Button
              startIcon={<People />}
              variant="outlined"
              onClick={() => setEditRoomMembersOpen(true)}
            >
              Add Members
            </Button>
            <Button
              startIcon={<Edit />}
              variant="outlined"
              onClick={() => setEditRoomNameOpen(true)}
            >
              Rename
            </Button>
            <Button
              startIcon={<Logout />}
              variant="outlined"
              onClick={() => {
                onLeave();
              }}
            >
              Leave Room
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </>
  );
}

function Chatroom(props: { chatroom_id: number; user_id: number; onLeave: () => void }) {
  const { chatroom_id, user_id, onLeave } = props;

  const { data: chatroom } = useChatroomsDetailGet({ chatroom_id });

  const { mutate: editRoom } = useChatroomsDetailPut({
    chatroom_id,
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>Ruangan berhasil diedit!</Typography>,
      });
    },
  });

  if (!chatroom) {
    return <Skeleton />;
  }

  return (
    <Stack height={"100%"} display={"flex"}>
      <ChatroomHeader
        chatroom_name={chatroom.chatroom_name}
        chatroom_users={chatroom.chatroom_users.map((x) => x.user_id)}
        onLeave={() => {
          editRoom({
            user_ids: chatroom.chatroom_users.map((x) => x.user_id).filter((x) => x !== user_id),
          });
          onLeave();
        }}
        onEditMembers={(members) => {
          editRoom({
            user_ids: members,
          });
        }}
        onEditName={(name) => {
          editRoom({
            name: name,
          });
        }}
      />
      <ChatroomComponent chatroom_id={chatroom_id} />
    </Stack>
  );
}

function ChatroomPageAuthorized(props: { user_id: number }) {
  const { user_id } = props;
  const [connected, setConnected] = useState(false);
  const [activeRoom, setActiveRoom] = useState<number | false>(false);

  const { data: chatrooms } = useUsersDetailChatroomsGet({
    user_id: user_id,
  });
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

  const selectedChatroom = chatrooms?.find((x) => x.chatroom_id === activeRoom);

  if (activeRoom !== false && chatrooms && selectedChatroom === undefined) {
    setActiveRoom(false);
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

  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [addRoomName, setAddRoomName] = useState("");

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
        {selectedChatroom && (
          <Chatroom
            user_id={user_id}
            chatroom_id={selectedChatroom.chatroom_id}
            onLeave={() => {
              setActiveRoom(false);
            }}
          />
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
