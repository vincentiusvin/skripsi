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
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { API } from "../../../backend/src/routes";
import { APIContext, APIError } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";
import { socket } from "../helpers/socket";
import {
  useChatroomDetail,
  useCreateRoom,
  useEditRoom,
  useMessage,
  useSendMessage,
} from "../queries/chat_hooks";
import { useSession } from "../queries/sesssion_hooks";
import { useUsers } from "../queries/user_hooks";

type MessageAcc = {
  message: string;
  user_id: number;
  created_at: Date;
};

function Chatroom(props: { chatroom_id: number; name: string }) {
  const { chatroom_id, name } = props;

  const [draft, setDraft] = useState("");

  const { data: sessionData } = useSession();
  const { data: usersData } = useUsers();
  const { data: chatroom } = useChatroomDetail(chatroom_id);
  const { data: messages } = useMessage(chatroom_id);
  const { mutate: sendMessage } = useSendMessage(chatroom_id, draft, () => {
    setDraft("");
  });

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current !== null) {
      bottomRef.current.scrollIntoView(true);
    }
  }, [messages]);

  useEffect(() => {
    if (chatroom) {
      setEditRoomMembers(chatroom.chatroom_users.map((x) => x.user_id));
      setEditRoomName(chatroom.chatroom_name);
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

  const { mutate: editRoom } = useEditRoom(chatroom_id, editRoomName, editRoomMembers, () => {
    enqueueSnackbar({
      variant: "success",
      message: <Typography>Ruangan berhasil diedit!</Typography>,
    });
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
        {messages?.map((x, i) => {
          const user = usersData?.find((u) => u.user_id === x.user_id);
          return (
            <Stack
              key={i}
              direction={"row"}
              spacing={2}
              ref={i === messages.length - 1 ? bottomRef : null}
            >
              <Avatar></Avatar>
              <Box>
                {!!user && <Typography fontWeight={"bold"}>{user.user_name}</Typography>}
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
          );
        })}
      </Stack>
      <Stack my={2} direction={"row"} display={"flex"} spacing={2}>
        <TextField
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              sendMessage();
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
            sendMessage();
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

  const { data: sessionData } = useSession();
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

  const { mutate: createRoom } = useCreateRoom(
    addRoomName,
    sessionData?.logged ? [sessionData.user_id] : [],
    () => {
      enqueueSnackbar({
        message: <Typography>Room created!</Typography>,
        variant: "success",
      });
      setAddRoomOpen(false);
    },
  );

  useEffect(() => {
    if (!sessionData?.logged) {
      return;
    }
    socket.connect();
    socket.on("connect", () => {
      setConnected(true);
    });
    socket.on("roomUpdate", () => {
      queryClient.invalidateQueries({
        queryKey: ["chatrooms"],
      });
    });
    socket.on("msg", (chatroom_id: number, msg: string) => {
      const msgObj: MessageAcc = JSON.parse(msg);
      queryClient.setQueryData(
        ["messages", "detail", chatroom_id],
        (old: API["GetMessages"]["ResBody"]) => (old ? [...old, msgObj] : [msgObj]),
      );
    });
    socket.on("disconnect", () => {
      setConnected(false);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("roomUpdate");
      socket.off("msg");
      socket.disconnect();
    };
  }, [sessionData?.logged && sessionData.user_id]);

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
              <Chatroom key={i} chatroom_id={x.chatroom_id} name={x.chatroom_name} />
            ),
        )}
      </Grid>
    </Grid>
  );
}

export default ChatroomPage;
