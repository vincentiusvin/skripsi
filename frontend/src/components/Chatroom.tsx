import { Send } from "@mui/icons-material";
import { Avatar, Box, Button, Stack, TextField, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import {
  useChatroomsDetailMessagesGet,
  useChatroomsDetailMessagesPost,
} from "../queries/chat_hooks.ts";
import { useUserAccountDetailGet } from "../queries/user_hooks.ts";

function Message(props: {
  message: {
    message: string;
    user_id: number;
    created_at: Date;
  };
}) {
  const { message } = props;
  const { data: user_data } = useUserAccountDetailGet({ user_id: message.user_id });
  return (
    <Stack direction={"row"} spacing={2}>
      <Avatar src={user_data?.user_name}></Avatar>
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
            <Message message={x} />
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
