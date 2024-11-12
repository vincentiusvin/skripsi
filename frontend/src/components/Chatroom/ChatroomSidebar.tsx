import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Skeleton,
} from "@mui/material";
import { ReactNode } from "react";
import avatarFallback from "../../helpers/avatar_fallback.tsx";
import { useChatroomsDetailGet, useChatroomsDetailMessagesGet } from "../../queries/chat_hooks.ts";
import UserAvatar from "../UserAvatar.tsx";

function ChatroomSidebar(props: {
  chatroom_id: number;
  user_id: number;
  selected?: boolean;
  onClick?: () => void;
}) {
  const { chatroom_id, user_id, selected, onClick } = props;
  const { data: chatroom } = useChatroomsDetailGet({
    chatroom_id,
  });
  const { data: messages } = useChatroomsDetailMessagesGet({
    chatroom_id,
  });

  if (chatroom == undefined) {
    return <Skeleton />;
  }

  let subheader: string | undefined;
  if (messages != undefined && messages.length > 0) {
    const last_msg = messages[messages.length - 1];
    if (last_msg.message.length !== 0) {
      subheader = last_msg.message;
    } else {
      subheader = "File";
    }
  }

  const users = chatroom.chatroom_users.map((x) => x.user_id);
  const members = users.length;
  let avatar: ReactNode;
  if (chatroom.project_id != null) {
    const img = avatarFallback({ label: chatroom.chatroom_name, seed: chatroom_id });
    avatar = <Avatar src={img} />;
  } else if (members <= 1) {
    const user_to_show = users.filter((x) => x !== user_id)[0] ?? user_id;
    avatar = <UserAvatar user_id={user_to_show} />;
  } else {
    const img = avatarFallback({ label: `${members}+`, seed: chatroom_id });
    avatar = <Avatar src={img} />;
  }

  return (
    <ListItem disableGutters>
      <ListItemButton
        selected={selected}
        onClick={() => {
          if (onClick) {
            onClick();
          }
        }}
      >
        <ListItemAvatar>{avatar}</ListItemAvatar>
        <ListItemText
          primary={chatroom.chatroom_name}
          primaryTypographyProps={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          secondary={subheader}
          secondaryTypographyProps={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        ></ListItemText>
      </ListItemButton>
    </ListItem>
  );
}

export default ChatroomSidebar;
