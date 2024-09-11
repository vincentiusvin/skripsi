import { Cancel, Check, Edit, Send } from "@mui/icons-material";
import { Avatar, Box, Button, IconButton, Stack, TextField, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import {
  useChatroomsDetailMessagesGet,
  useChatroomsDetailMessagesPost,
  useChatroomsDetailMessagesPut,
} from "../queries/chat_hooks.ts";
import { useUsersDetailGet } from "../queries/user_hooks.ts";

function Message(props: {
  message: {
    id: number;
    message: string;
    user_id: number;
    created_at: Date;
  };
  chatroom_id: number;
}) {
  const { message, chatroom_id } = props;
  const { data: user_data } = useUsersDetailGet({ user_id: message.user_id });
  const [isEditing, setIsEditing] = useState(false);
  const { mutate: updateMessage } = useChatroomsDetailMessagesPut({
    chatroom_id,
    message_id: message.id,
  });
  const [editMsg, setEditMsg] = useState<string | undefined>();

  return (
    <Stack direction={"row"} spacing={2} alignItems={"center"}>
      {isEditing ? (
        <>
          <Avatar src={user_data?.user_image ?? ""}></Avatar>
          <Box>
            <Typography fontWeight={"bold"}>{user_data?.user_name}</Typography>
            <TextField
              fullWidth
              onChange={(e) => {
                setEditMsg(e.target.value);
              }}
              defaultValue={message.message}
            ></TextField>
            <Typography variant="caption">
              {dayjs(message.created_at).format("ddd[,] D[/]M[/]YY HH:mm")}
            </Typography>
          </Box>
          <IconButton
            onClick={() => {
              if (editMsg) {
                updateMessage(editMsg);
              }
              setIsEditing(false);
              setEditMsg(undefined);
            }}
          >
            <Check />
          </IconButton>
          <IconButton
            onClick={() => {
              setIsEditing(false);
              setEditMsg(undefined);
            }}
          >
            <Cancel />
          </IconButton>
        </>
      ) : (
        <>
          <Avatar src={user_data?.user_image ?? ""}></Avatar>
          <Box>
            <Typography fontWeight={"bold"}>{user_data?.user_name}</Typography>
            <Typography
              sx={{
                wordBreak: "break-word",
              }}
            >
              {message.message}
            </Typography>
            <Typography variant="caption">
              {dayjs(message.created_at).format("ddd[,] D[/]M[/]YY HH:mm")}
            </Typography>
          </Box>
          <Box>
            <IconButton
              onClick={() => {
                setIsEditing(true);
              }}
            >
              <Edit />
            </IconButton>
          </Box>
        </>
      )}
    </Stack>
  );
}

export function ChatroomComponent(props: { chatroom_id: number }) {
  const { chatroom_id } = props;
  const [draft, setDraft] = useState("");
  const { mutate: sendMessage } = useChatroomsDetailMessagesPost({ chatroom_id });
  const { data: messages } = useChatroomsDetailMessagesGet({ chatroom_id });

  function send() {
    setDraft("");
    sendMessage(draft);
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
          <Box ref={i === messages.length - 1 ? bottomRef : null} key={i}>
            <Message message={x} chatroom_id={chatroom_id} />
          </Box>
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

export default ChatroomComponent;
