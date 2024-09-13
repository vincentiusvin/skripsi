import { ArrowLeft, ArrowRight, MoreVert } from "@mui/icons-material";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Menu,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import ChatroomComponent from "../../../components/Chatroom/Chatroom.tsx";
import { ChangeNameDialog } from "../../../components/Chatroom/ChatroomMisc.tsx";
import {
  useChatSocket,
  useProjectsDetailChatroomsGet,
  useProjectsDetailChatroomsPost,
} from "../../../queries/chat_hooks.ts";

export function ChatroomWrapper(props: { user_id: number; project_id: number }) {
  const { project_id, user_id } = props;
  const [connected, setConnected] = useState(false);
  const [activeRoom, setActiveRoom] = useState<number | false>(false);
  const { data: chatrooms } = useProjectsDetailChatroomsGet({ project_id });
  const selectedChatroom = chatrooms?.find((x) => x.chatroom_id === activeRoom);

  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [addRoomName, setAddRoomName] = useState("");

  const [sideOpen, setSideOpen] = useState(false);

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
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | undefined>();

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
        {sideOpen || selectedChatroom == undefined ? (
          <Grid item xs={4} lg={2}>
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
              scrollButtons="auto"
              allowScrollButtonsMobile
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
        ) : null}
        <Grid item xs={sideOpen ? 8 : 12} lg={sideOpen ? 10 : 12}>
          {selectedChatroom && (
            <Stack height={"100%"} display={"flex"}>
              <Paper>
                <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
                  {sideOpen ? (
                    <IconButton onClick={() => setSideOpen(() => false)}>
                      <ArrowLeft />
                    </IconButton>
                  ) : (
                    <IconButton onClick={() => setSideOpen(() => true)}>
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
                    <ChangeNameDialog chatroom_id={selectedChatroom.chatroom_id} />
                  </Menu>
                  <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
                    <MoreVert />
                  </IconButton>
                </Stack>
              </Paper>
              <ChatroomComponent chatroom_id={selectedChatroom.chatroom_id} />
            </Stack>
          )}
        </Grid>
      </Grid>
    </>
  );
}
