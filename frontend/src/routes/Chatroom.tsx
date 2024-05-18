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
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { API } from "../../../backend/src/routes";
import { APIContext, APIError } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";
import { socket } from "../helpers/socket";

type MessagePend = string;

type MessageAcc = {
  message: string;
  user_id: number;
  created_at: Date;
};

function Chatroom(props: {
  chatroom_id: number;
  name: string;
  onSend: (msg: MessagePend) => void;
  onRoomEdit: () => void;
}) {
  const { onSend, chatroom_id, name, onRoomEdit } = props;

  const [draft, setDraft] = useState("");

  const { data: sessionData } = useQuery({
    queryKey: ["session"],
    queryFn: () => new APIContext("GetSession").fetch("/api/session"),
  });

  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: () => new APIContext("GetUser").fetch("/api/users"),
  });

  const { data: chatroom } = useQuery({
    queryKey: ["chatrooms", "detail", chatroom_id],
    queryFn: () =>
      new APIContext("GetChatroomDetail").fetch(`/api/chatrooms/${chatroom_id}`).then((x) => {
        setEditRoomMembers(x.chatroom_users.map((x) => x.user_id));
        setEditRoomName(x.chatroom_name);
        return x;
      }),
  });

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current !== null) {
      bottomRef.current.scrollIntoView(true);
    }
  }, [chatroom]);

  const [editRoomNameOpen, setEditRoomNameOpen] = useState(false);
  const [editRoomMembersOpen, setEditRoomMembersOpen] = useState(false);
  const [editRoomName, setEditRoomName] = useState("");
  const [editRoomMembers, setEditRoomMembers] = useState<number[]>([]);

  const inUsers: typeof usersData & [] = [];
  const pendingUsers: typeof usersData & [] = [];
  const outUsers: typeof usersData & [] = [];

  usersData?.forEach((x) => {
    if (chatroom?.chatroom_users.map((x) => x.user_id).includes(x.user_id)) {
      inUsers.push(x);
    } else if (editRoomMembers.includes(x.user_id)) {
      pendingUsers.push(x);
    } else {
      outUsers.push(x);
    }
  });

  const { mutate: editRoom } = useMutation({
    mutationKey: ["chatrooms"],
    mutationFn: async () => {
      if (!sessionData || !chatroom) {
        throw new Error("Anda harus login!");
      }
      const res = await new APIContext("PostChatrooms").fetch(
        `/api/chatrooms/${chatroom.chatroom_id}`,
        {
          method: "PUT",
          body: {
            name: editRoomName,
            user_ids: editRoomMembers,
          },
        },
      );
      return res;
    },
    onSuccess: (x) => {
      onRoomEdit();
      queryClient.invalidateQueries({
        queryKey: ["chatrooms"],
      });
      enqueueSnackbar({
        variant: "success",
        message: <Typography>{x.msg}</Typography>,
      });
    },
  });

  if (!sessionData?.logged) {
    return null;
  }
  if (!chatroom) {
    return <Skeleton />;
  }

  return (
    <Stack height={"100%"} display={"flex"}>
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
              editRoom();
              setEditRoomNameOpen(false);
            }}
          >
            Rename Room
          </Button>
        </DialogActions>
      </Dialog>
      {usersData && (
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
                editRoom();
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
            {name}
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
                if (!chatroom) {
                  return;
                }
                setEditRoomMembers(
                  chatroom.chatroom_users
                    .filter((x) => x.user_id !== sessionData.user_id)
                    .map((x) => x.user_id),
                );
                setEditRoomName(chatroom.chatroom_name);
                editRoom();
              }}
            >
              Leave Room
            </Button>
          </Stack>
        </Stack>
      </Paper>
      <Stack mt={2} marginLeft={2} spacing={1} overflow={"auto"} flexGrow={1} flexBasis={0}>
        {chatroom?.chatroom_messages.map((x, i) => (
          <Stack
            key={i}
            direction={"row"}
            spacing={2}
            ref={i === chatroom.chatroom_messages.length - 1 ? bottomRef : null}
          >
            <Avatar></Avatar>
            <Box>
              <Typography
                sx={{
                  wordBreak: "break-word",
                }}
              >
                {x.message}
              </Typography>
              <Typography variant="caption">
                {dayjs(x.created_at).format("ddd[,] D[/]M[/]YY HH:mm:ss")}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
      <Stack my={2} direction={"row"} display={"flex"} spacing={2}>
        <TextField
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSend(draft);
              setDraft("");
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
        <Button
          onClick={() => {
            onSend(draft);
            setDraft("");
          }}
          variant="contained"
        >
          <Send />
        </Button>
      </Stack>
    </Stack>
  );
}

function ChatroomPage() {
  const [connected, setConnected] = useState(false);
  const [activeRoom, setActiveRoom] = useState<number | false>(false);

  const [, setLocation] = useLocation();

  const { data: sessionData } = useQuery({
    queryKey: ["session"],
    queryFn: () => new APIContext("GetSession").fetch("/api/session"),
  });

  const { data: chatrooms } = useQuery({
    queryKey: ["chatrooms", "collection", sessionData?.logged && sessionData.user_id],
    queryFn: () =>
      new APIContext("GetChatrooms").fetch("/api/chatrooms").then((x) => {
        if (activeRoom !== false && !x.map((y) => y.chatroom_id).includes(activeRoom)) {
          setActiveRoom(false);
        }
        return x;
      }),
    retry: (failureCount, error) => {
      if ((error instanceof APIError && error.status === 401) || failureCount > 3) {
        setLocation("/");
        return false;
      }
      return true;
    },
  });

  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [addRoomName, setAddRoomName] = useState("");

  const { mutate: createRoom } = useMutation({
    mutationKey: ["chatrooms"],
    mutationFn: async () => {
      if (!sessionData?.logged) {
        return;
      }
      const res = await new APIContext("PostChatrooms").fetch("/api/chatrooms", {
        method: "POST",
        body: {
          name: addRoomName,
          user_ids: [sessionData.user_id],
        },
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chatrooms"],
      });
      enqueueSnackbar({
        message: <Typography>Room created!</Typography>,
        variant: "success",
      });
      setAddRoomOpen(false);
    },
  });

  function sendMessage(chatroom_id: number, msg: string) {
    if (msg.length === 0) {
      enqueueSnackbar({
        message: <Typography>Cannot send empty message!</Typography>,
        variant: "error",
      });
    }
    socket?.emit("msgPend", chatroom_id, msg);
  }

  useEffect(() => {
    if (chatrooms === undefined) {
      return;
    }

    socket.connect();
    socket.on("connect", () => {
      setConnected(true);
    });
    socket.on("roomEdit", () => {
      queryClient.invalidateQueries({
        queryKey: ["chatrooms"],
      });
    });
    socket.on("msgAcc", (chatroom_id: number, msg: string) => {
      const msgObj: MessageAcc = JSON.parse(msg);
      queryClient.setQueryData(
        ["chatrooms", "detail", chatroom_id],
        (old: API["GetChatroomDetail"]["ResBody"]) => {
          const temp = { ...old };
          temp.chatroom_messages = [...temp.chatroom_messages];
          temp.chatroom_messages.push(msgObj);
          return temp;
        },
      );
    });
    socket.on("disconnect", () => {
      setConnected(false);
    });

    return () => {
      socket.off("connect");
      socket.off("msgAcc");
      socket.off("disconnect");
      socket.off("roomEdit");
      socket.disconnect();
    };
  }, [chatrooms, sessionData?.logged && sessionData.user_id]);

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
          onChange={(e, newRoomId) => {
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
              <Chatroom
                key={i}
                chatroom_id={x.chatroom_id}
                name={x.chatroom_name}
                onSend={(msg) => sendMessage(x.chatroom_id, msg)}
                onRoomEdit={() => socket.emit("roomEdit", x.chatroom_id)}
              />
            ),
        )}
      </Grid>
    </Grid>
  );
}

export default ChatroomPage;
