import { Alert, Snackbar, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useState } from "react";
import { useSearchParams, useStateSearch } from "../../helpers/search.ts";
import { useChatSocket } from "../../queries/chat_hooks.ts";
import ChatroomContent from "./ChatroomContent.tsx";
import ChatroomHeader from "./ChatroomHeader.tsx";
import ChatroomSidebar from "./ChatroomSidebar.tsx";

function useRoomSelection(allowed_rooms: number[]) {
  let activeRoom: false | number = false;

  const searchHook = useSearchParams();
  const [activeRoomRaw, setActiveRoom] = useStateSearch("room", searchHook);
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

function Chatroom(props: { user_id: number; allowed_rooms: number[]; project_id?: number }) {
  const { user_id, allowed_rooms, project_id } = props;

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

  return (
    <Grid container minHeight={"inherit"} height={2} spacing={1}>
      <Snackbar open={!connected}>
        <Alert severity="error">
          <Typography>Koneksi chat terputus!</Typography>
        </Alert>
      </Snackbar>
      {sideOpen || selectedRoom === false ? (
        <Grid
          size={3}
          sx={{
            overflow: "scroll",
            height: "100%",
            paddingRight: 2,
          }}
        >
          <ChatroomSidebar
            project_id={project_id}
            onChange={(x) => setSelectedRoom(x)}
            selectedRoom={selectedRoom}
            allowed_rooms={allowed_rooms}
            user_id={user_id}
          />
        </Grid>
      ) : null}
      <Grid size={sideOpen ? 9 : 12}>
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
              }}
              user_id={user_id}
            />
            <ChatroomContent chatroom_id={selectedRoom} />
          </Stack>
        )}
      </Grid>
    </Grid>
  );
}

export default Chatroom;
