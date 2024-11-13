import { ArrowLeft, ArrowRight, MoreVert } from "@mui/icons-material";
import { IconButton, Menu, Paper, Skeleton, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useChatroomsDetailGet } from "../../queries/chat_hooks.ts";
import { AddMembersDialog, ChangeNameDialog, LeaveRoom } from "./ChatroomMisc.tsx";

function ChatroomHeader(props: {
  chatroom_id: number;
  back: boolean;
  setBack: (x: boolean) => void;
  user_id: number;
  onLeave: () => void;
}) {
  const { onLeave, user_id, chatroom_id, back, setBack } = props;

  const { data: room } = useChatroomsDetailGet({
    chatroom_id,
  });

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | undefined>();

  if (room == undefined) {
    return (
      <Paper>
        <Skeleton />
      </Paper>
    );
  }

  return (
    <Paper>
      <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
        {back ? (
          <IconButton variant="outlined" onClick={() => setBack(false)}>
            <ArrowLeft />
          </IconButton>
        ) : (
          <IconButton variant="outlined" onClick={() => setBack(true)}>
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
          {room.chatroom_name}
        </Typography>
        <Menu
          open={menuAnchor != undefined}
          anchorEl={menuAnchor}
          onClose={() => setMenuAnchor(undefined)}
        >
          <AddMembersDialog chatroom_id={chatroom_id} />
          <ChangeNameDialog chatroom_id={chatroom_id} />
          <LeaveRoom
            chatroom_id={chatroom_id}
            user_id={user_id}
            onLeave={() => {
              setMenuAnchor(undefined);
              onLeave();
            }}
          />
        </Menu>
        <IconButton variant="outlined" onClick={(e) => setMenuAnchor(e.currentTarget)}>
          <MoreVert />
        </IconButton>
      </Stack>
    </Paper>
  );
}

export default ChatroomHeader;
