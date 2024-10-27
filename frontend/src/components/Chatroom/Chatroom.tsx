import {
  AttachFile,
  Cancel,
  Check,
  Clear,
  Download,
  Edit,
  InsertDriveFile,
  Send,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import type { MessageData } from "../../../../backend/src/sockets";
import { fileToBase64DataURL } from "../../helpers/file.ts";
import {
  useChatroomsDetailMessagesGet,
  useChatroomsDetailMessagesPost,
  useChatroomsDetailMessagesPut,
} from "../../queries/chat_hooks.ts";
import { useSessionGet } from "../../queries/sesssion_hooks.ts";
import { useUsersDetailGet } from "../../queries/user_hooks.ts";
import FileDropzone from "../FileDropzone.tsx";
import StyledLink from "../StyledLink.tsx";
import UserAvatar from "../UserAvatar.tsx";

function DownloadableFile(props: { filename: string; file_id: number }) {
  const { filename, file_id } = props;
  const isImage =
    filename.endsWith(".jpeg") || filename.endsWith(".jpg") || filename.endsWith(".png");

  if (isImage) {
    return (
      <Avatar
        src={`/api/files/${file_id}`}
        variant="rounded"
        sx={{
          margin: 2,
          maxWidth: {
            xs: "200px",
            sm: "300px",
            md: "400px",
          },
          width: "100%",
          height: "100%",
        }}
      />
    );
  }

  return (
    <Paper
      elevation={4}
      variant="elevation"
      sx={{
        padding: 1,
      }}
    >
      <Stack direction="row" alignItems={"center"} spacing={2}>
        <InsertDriveFile
          sx={{
            height: "50px",
            width: "50px",
          }}
        />
        <Typography
          flexGrow={1}
          variant="body1"
          textAlign={"left"}
          sx={{
            wordBreak: "break-word",
          }}
        >
          {filename}
        </Typography>
        {/* Pake yang MUI punya, yang wouter gabisa buka di new tab */}
        <Link href={`/api/files/${file_id}`} target="_blank">
          <IconButton variant="outlined" color="default">
            <Download />
          </IconButton>
        </Link>
      </Stack>
    </Paper>
  );
}

function Message(props: { message: MessageData; chatroom_id: number }) {
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

  function update() {
    if (editMsg) {
      updateMessage({ message: editMsg });
    }
    setIsEditing(false);
    setEditMsg(undefined);
  }

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
                maxRows={5}
                onKeyDown={(event) => {
                  if (!event.shiftKey && event.key === "Enter") {
                    update();
                    event.preventDefault();
                  }
                }}
                multiline
                fullWidth
                onChange={(e) => {
                  setEditMsg(e.target.value);
                }}
                value={editMsg ?? message.message}
              ></TextField>
              {message.files != undefined && message.files.length > 0 ? (
                <Stack spacing={1} marginTop={1} direction="column">
                  <Divider />
                  {message.files.map((file) => (
                    <DownloadableFile key={file.id} file_id={file.id} filename={file.filename} />
                  ))}
                </Stack>
              ) : null}
              <Typography variant="caption">
                {dayjs(message.created_at).format("ddd[,] D[/]M[/]YY HH:mm")}
              </Typography>
            </Box>
            <IconButton variant="outlined" onClick={update}>
              <Check />
            </IconButton>
            <IconButton
              variant="outlined"
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
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {message.message}
                </Typography>
                {message.files != undefined && message.files.length > 0 ? (
                  <Stack spacing={1} marginTop={1} direction="column">
                    <Divider />
                    {message.files.map((file) => (
                      <DownloadableFile key={file.id} file_id={file.id} filename={file.filename} />
                    ))}
                  </Stack>
                ) : null}
              </Paper>
              <Typography variant="caption">
                {dayjs(message.created_at).format("ddd[,] D[/]M[/]YY HH:mm")}
                {message.is_edited ? " (Edited)" : ""}
              </Typography>
            </Stack>
            <Box>
              <IconButton
                variant="outlined"
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
        {user_data != null ? (
          <StyledLink to={`/users/${user_data.user_id}`}>
            <UserAvatar user_id={user_data.user_id} />
          </StyledLink>
        ) : (
          <Avatar />
        )}
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
            {message.files != undefined && message.files.length > 0 ? (
              <Stack spacing={1} marginTop={1} direction="column">
                <Divider />
                {message.files.map((file) => (
                  <DownloadableFile key={file.id} file_id={file.id} filename={file.filename} />
                ))}
              </Stack>
            ) : null}
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
  b64: string;
};

function FileDisplay(props: FileData & { onDelete?: () => void }) {
  const { onDelete, b64, file } = props;
  const isRenderableImage = ["image/png", "image/jpeg", "image/jpg"].includes(file.type) && b64;

  return (
    <Paper
      sx={{
        position: "relative",
        width: "100px",
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
            height: "100px",
            width: "100px",
          }}
          src={b64}
        />
      ) : (
        <InsertDriveFile
          sx={{
            height: "100px",
            width: "100px",
          }}
        />
      )}
      <Divider />
      <Typography
        variant="body1"
        textAlign={"center"}
        sx={{
          wordBreak: "break-word",
        }}
        width={"100%"}
      >
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

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current !== null) {
      bottomRef.current.scrollIntoView({
        block: "end",
      });
    }
  }, [messages?.length]);

  function send() {
    sendMessage({
      message: draft,
      files: files.map((x) => ({
        filename: x.file.name,
        content: x.b64,
      })),
    });
    setDraft("");
    setFiles([]);
  }

  return (
    <FileDropzone
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
      }}
      disableClick
      onChange={async (file) => {
        if (file == null) {
          return;
        }
        const img = await fileToBase64DataURL(file);
        setFiles((x) => [
          ...x,
          {
            file,
            b64: img,
          },
        ]);
      }}
    >
      <Stack mt={2} marginLeft={2} spacing={1} overflow={"auto"} flexGrow={1} flexBasis={0}>
        {messages?.map((x, i) => (
          <Box key={i} ref={i === messages.length - 1 ? bottomRef : null}>
            <Message message={x} chatroom_id={chatroom_id} />
          </Box>
        ))}
      </Stack>
      <Stack my={2} direction={"row"} display={"flex"} spacing={2}>
        <FileDropzone
          sx={{ display: "flex" }}
          onChange={async (file) => {
            if (file == null) {
              return;
            }
            const img = await fileToBase64DataURL(file);
            setFiles((x) => [
              ...x,
              {
                file,
                b64: img,
              },
            ]);
          }}
        >
          <IconButton variant="outlined">
            <AttachFile />
          </IconButton>
        </FileDropzone>
        <TextField
          multiline
          maxRows={5}
          onPaste={async (event) => {
            const files = event.clipboardData.files;
            if (files.length) {
              for (const file of files) {
                const img = await fileToBase64DataURL(file);
                setFiles((x) => [
                  ...x,
                  {
                    file,
                    b64: img,
                  },
                ]);
              }
            }
          }}
          onKeyDown={(event) => {
            if (!event.shiftKey && event.key === "Enter") {
              send();
              event.preventDefault();
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
          <Stack direction={"row"} gap={4} flexWrap={"wrap"}>
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
    </FileDropzone>
  );
}

export default ChatroomComponent;
