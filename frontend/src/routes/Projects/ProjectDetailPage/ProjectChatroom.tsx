import {
  Alert,
  Button,
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
import { useState } from "react";
import {
  useChatSocket,
  useChatroomsDetailGet,
  useChatroomsDetailMessagesGet,
  useChatroomsDetailMessagesPost,
  useProjectsDetailChatroomsGet,
  useProjectsDetailChatroomsPost,
} from "../../../queries/chat_hooks.ts";
import { useUsersGet } from "../../../queries/user_hooks.ts";
import { ChatroomContent } from "../../Chatroom.tsx";

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

export function ChatroomWrapper(props: { user_id: number; project_id: number }) {
  const { project_id, user_id } = props;
  const [connected, setConnected] = useState(false);
  const [activeRoom, setActiveRoom] = useState<number | false>(false);
  const { data: chatrooms } = useProjectsDetailChatroomsGet({ project_id });
  const selectedChatroom = chatrooms?.find((x) => x.chatroom_id === activeRoom);

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
    <>
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
  );
}
