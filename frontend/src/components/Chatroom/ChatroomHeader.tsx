import { ArrowLeft, ArrowRight, MoreVert } from "@mui/icons-material";
import { IconButton, Paper, Popover, Skeleton, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useChatroomsDetailGet } from "../../queries/chat_hooks.ts";
import {
  AddMembersDialog,
  ChangeNameDialog,
  DeleteRoom,
  EditMembersDialog,
  LeaveRoom,
} from "./ChatroomMisc.tsx";

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
            <ArrowRight />
          </IconButton>
        ) : (
          <IconButton variant="outlined" onClick={() => setBack(true)}>
            <ArrowLeft />
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
          textAlign={"center"}
        >
          {room.chatroom_name}
        </Typography>
        <Popover
          open={menuAnchor != undefined}
          anchorEl={menuAnchor}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          onClose={() => setMenuAnchor(undefined)}
        >
          {room.project_id == null ? <AddMembersDialog chatroom_id={chatroom_id} /> : null}
          {room.project_id == null ? <EditMembersDialog chatroom_id={chatroom_id} /> : null}
          <ChangeNameDialog chatroom_id={chatroom_id} />
          {room.project_id != null ? (
            <DeleteRoom
              chatroom_id={chatroom_id}
              onLeave={() => {
                setMenuAnchor(undefined);
                onLeave();
              }}
            />
          ) : (
            <LeaveRoom
              chatroom_id={chatroom_id}
              user_id={user_id}
              onLeave={() => {
                setMenuAnchor(undefined);
                onLeave();
              }}
            />
          )}
        </Popover>
        <IconButton variant="outlined" onClick={(e) => setMenuAnchor(e.currentTarget)}>
          <MoreVert />
        </IconButton>
      </Stack>
    </Paper>
  );
}

export default ChatroomHeader;
