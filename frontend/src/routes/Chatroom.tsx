import { Add, Edit, Logout, People, Remove, Send } from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
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
import dayjs from "dayjs";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useRef, useState } from "react";
import { Redirect } from "wouter";
import {
  useChatSocket,
  useChatroomsDetailGet,
  useChatroomsDetailMessagesGet,
  useChatroomsDetailMessagesPost,
  useChatroomsDetailPut,
  useUsersDetailChatroomsGet,
  useUsersDetailChatroomsPost,
} from "../queries/chat_hooks";
import { useSessionGet } from "../queries/sesssion_hooks";
import { useUsersGet } from "../queries/user_hooks";

export function ChatroomContent(props: {
  messages: {
    message: string;
    user_name: string;
    user_avatar?: string;
    created_at: Date;
  }[];
  onSend: (msg: string) => void;
}) {
  const { messages, onSend } = props;
  const [draft, setDraft] = useState("");

  function send() {
    setDraft("");
    onSend(draft);
  }

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current !== null) {
      bottomRef.current.scrollIntoView(true);
    }
  }, [messages]);

  return (
    <>
      <Stack mt={2} marginLeft={2} spacing={1} overflow={"auto"} flexGrow={1} flexBasis={0}>
        {messages?.map((x, i) => (
          <Stack
            key={i}
            direction={"row"}
            spacing={2}
            ref={i === messages.length - 1 ? bottomRef : null}
          >
            <Avatar></Avatar>
            <Box>
              <Typography fontWeight={"bold"}>{x.user_name}</Typography>
              <Typography
                sx={{
                  wordBreak: "break-word",
                }}
              >
                {x.message}
              </Typography>
              <Typography variant="caption">
                {dayjs(x.created_at).format("ddd[,] D[/]M[/]YY HH:mm")}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
      <Stack my={2} direction={"row"} display={"flex"} spacing={2}>
        <TextField
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              send();
            }
          }}
          value={draft}
          sx={{
            flexGrow: 1,
          }}
          onChange={(e) => {
            setDraft(e.target.value);
          }}
        ></TextField>
        <Button onClick={send} variant="contained">
          <Send />
        </Button>
      </Stack>
    </>
  );
}

export function ChatroomHeader(props: {
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

function Chatroom(props: { chatroom_id: number; user_id: number }) {
  const { chatroom_id, user_id } = props;

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
      <ChatroomContent
        onSend={(msg) => {
          sendMessage(msg);
        }}
        messages={reshaped_messages}
      />
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

  useEffect(() => {
    if (!chatrooms) {
      setActiveRoom(false);
      return;
    }
    if (activeRoom === false) {
      return;
    }
    const found = chatrooms.map((x) => x.chatroom_id).includes(activeRoom);
    if (!found) {
      setActiveRoom(false);
    }
  }, [chatrooms]);

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
        {chatrooms?.map(
          (x, i) =>
            activeRoom === x.chatroom_id && (
              <Chatroom key={i} user_id={user_id} chatroom_id={x.chatroom_id} />
            ),
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
