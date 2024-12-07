import { Alert, Snackbar, Stack, Theme, Typography, useMediaQuery } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useState } from "react";
import { useStateSearch } from "../../helpers/search.ts";
import { useChatSocket } from "../../queries/chat_hooks.ts";
import ChatroomContent from "./ChatroomContent.tsx";
import ChatroomHeader from "./ChatroomHeader.tsx";
import ChatroomSidebar from "./ChatroomSidebar.tsx";

function useRoomSelection(allowed_rooms: number[]) {
  let activeRoom: false | number = false;

  const [activeRoomRaw, setActiveRoom] = useStateSearch("room");
  const tryNumber = Number(activeRoomRaw);
  if (!Number.isNaN(tryNumber)) {
    activeRoom = tryNumber;
  }

  const validSelection = activeRoom !== false && allowed_rooms.includes(activeRoom);

  if (validSelection) {
    return [activeRoom, setActiveRoom] as const;
  } else {
    return [false, setActiveRoom] as const;
  }
}

function Chatroom(props: {
  keyword?: string;
  onChangeKeyword?: (x: string) => void;
  user_id: number;
  allowed_rooms: number[];
  project_id?: number;
}) {
  const { keyword, onChangeKeyword, user_id, allowed_rooms, project_id } = props;

  const responsive = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));

  const [connected, setConnected] = useState(false);
  useChatSocket({
    userId: user_id,
    onConnect: () => {
      setConnected(true);
    },
    onDisconnect: () => {
      setConnected(false);
    },
  });

  const [selectedRoom, setSelectedRoom] = useRoomSelection(allowed_rooms);
  const [sideOpen, setSideOpen] = useState(false);

  let showSidebar;
  let showChat;

  if (responsive) {
    showChat = selectedRoom !== false;
    showSidebar = !showChat;
  } else {
    showSidebar = sideOpen || selectedRoom === false;
    showChat = true;
  }

  return (
    <Grid container minHeight={"inherit"} height={2} spacing={1}>
      <Snackbar open={!connected}>
        <Alert severity="error">
          <Typography>Koneksi chat terputus!</Typography>
        </Alert>
      </Snackbar>
      {showSidebar ? (
        <Grid
          size={"grow"}
          sx={{
            overflow: "scroll",
            height: "100%",
            paddingRight: 2,
          }}
        >
          <ChatroomSidebar
            keyword={keyword}
            onChangeKeyword={onChangeKeyword}
            project_id={project_id}
            onChange={(x) => setSelectedRoom(x)}
            selectedRoom={selectedRoom}
            allowed_rooms={allowed_rooms}
            user_id={user_id}
          />
        </Grid>
      ) : null}
      {showChat ? (
        <Grid size={showSidebar ? 9 : 12}>
          {selectedRoom !== false && (
            <Stack height={"100%"} display={"flex"}>
              <ChatroomHeader
                back={sideOpen}
                chatroom_id={selectedRoom}
                onLeave={() => {
                  setSelectedRoom(false);
                }}
                setBack={(x) => {
                  setSideOpen(x);
                  if (responsive) {
                    setSelectedRoom(false);
                  }
                }}
                user_id={user_id}
              />
              <ChatroomContent key={selectedRoom} chatroom_id={selectedRoom} />
            </Stack>
          )}
        </Grid>
      ) : null}
    </Grid>
  );
}

export default Chatroom;
