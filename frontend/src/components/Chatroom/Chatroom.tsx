import { Cancel, Check, Clear, Edit, InsertDriveFile, Send } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { fileToBase64DataURL } from "../../helpers/file.ts";
import {
  useChatroomsDetailMessagesGet,
  useChatroomsDetailMessagesPost,
  useChatroomsDetailMessagesPut,
} from "../../queries/chat_hooks.ts";
import { useSessionGet } from "../../queries/sesssion_hooks.ts";
import { useUsersDetailGet } from "../../queries/user_hooks.ts";
import StyledLink from "../StyledLink.tsx";

function Message(props: {
  message: {
    id: number;
    message: string;
    user_id: number;
    created_at: Date;
    is_edited: boolean;
  };
  chatroom_id: number;
}) {
  const { message, chatroom_id } = props;
  const { data: session_data } = useSessionGet();
  const { data: user_data } = useUsersDetailGet({ user_id: message.user_id });
  const [isEditing, setIsEditing] = useState(false);
  const { mutate: updateMessage } = useChatroomsDetailMessagesPut({
    chatroom_id,
    message_id: message.id,
  });
  const [editMsg, setEditMsg] = useState<string | undefined>();

  const isOurs = session_data && session_data.logged && session_data.user_id === message.user_id;

  if (isOurs) {
    return (
      <Stack
        direction={"row"}
        spacing={2}
        alignItems={"center"}
        justifyContent={"flex-end"}
        textAlign={"right"}
      >
        {isEditing ? (
          <>
            <Box>
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
            <Stack direction={"column"} alignItems={"flex-end"}>
              <Paper
                sx={{
                  paddingY: 1,
                  paddingX: 2,
                }}
              >
                <Typography
                  sx={{
                    wordBreak: "break-word",
                  }}
                >
                  {message.message}
                </Typography>
              </Paper>
              <Typography variant="caption">
                {dayjs(message.created_at).format("ddd[,] D[/]M[/]YY HH:mm")}
                {message.is_edited ? " (Edited)" : ""}
              </Typography>
            </Stack>
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
  } else {
    return (
      <Stack direction={"row"} spacing={2} alignItems={"center"}>
        <StyledLink to={`/users/${user_data?.user_id}`}>
          <Avatar src={user_data?.user_image ?? ""}></Avatar>
        </StyledLink>
        <Stack direction={"column"} alignItems={"flex-start"}>
          <Typography fontWeight={"bold"}>{user_data?.user_name}</Typography>
          <Paper
            sx={{
              paddingY: 1,
              paddingX: 2,
            }}
          >
            <Typography
              sx={{
                wordBreak: "break-word",
              }}
            >
              {message.message}
            </Typography>
          </Paper>
          <Typography variant="caption">
            {dayjs(message.created_at).format("ddd[,] D[/]M[/]YY HH:mm")}
            {message.is_edited ? " (Edited)" : ""}
          </Typography>
        </Stack>
      </Stack>
    );
  }
}

type FileData = {
  file: File;
  b64?: string;
};

function FileDisplay(props: FileData & { onDelete?: () => void }) {
  const { onDelete, b64, file } = props;
  const isRenderableImage = ["image/png", "image/jpeg", "image/jpg"].includes(file.type) && b64;

  return (
    <Paper
      sx={{
        position: "relative",
      }}
    >
      <Button
        variant="contained"
        size="small"
        onClick={() => {
          if (onDelete) {
            onDelete();
          }
        }}
        sx={{
          right: 0,
          position: "absolute",
          zIndex: "tooltip",
          minWidth: 0,
        }}
      >
        <Clear />
      </Button>
      {isRenderableImage ? (
        <Avatar
          variant="rounded"
          sx={{
            height: "125px",
            width: "125px",
          }}
          src={b64}
        />
      ) : (
        <InsertDriveFile
          sx={{
            height: "125px",
            width: "125px",
          }}
        />
      )}
      <Divider />
      <Typography variant="body1" textAlign={"center"}>
        {file.name}
      </Typography>
    </Paper>
  );
}

export function ChatroomComponent(props: { chatroom_id: number }) {
  const { chatroom_id } = props;
  const [draft, setDraft] = useState("");
  const { mutate: sendMessage } = useChatroomsDetailMessagesPost({ chatroom_id });
  const { data: messages } = useChatroomsDetailMessagesGet({ chatroom_id });
  const [files, setFiles] = useState<FileData[]>([]);

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
          onPaste={async (event) => {
            const files = event.clipboardData.files;
            if (files.length) {
              for (const file of files) {
                const img = await fileToBase64DataURL(file);
                setFiles((x) => [
                  ...x,
                  {
                    file,
                    b64: img ?? undefined,
                  },
                ]);
              }
            }
          }}
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
      {files.length ? (
        <Box>
          <Typography variant="h6">Files</Typography>
          <Divider
            sx={{
              marginBottom: 1,
            }}
          />
          <Stack direction={"row"} spacing={4}>
            {files.map(({ file, b64 }, i) => (
              <FileDisplay
                onDelete={() => {
                  setFiles((x) => {
                    return x.filter((x) => x.file !== file);
                  });
                }}
                key={i}
                file={file}
                b64={b64}
              />
            ))}
          </Stack>
        </Box>
      ) : null}
    </>
  );
}

export default ChatroomComponent;
