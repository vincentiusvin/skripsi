import { SearchOutlined } from "@mui/icons-material";
import {
  Avatar,
  Divider,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Skeleton,
  Stack,
  TextField,
} from "@mui/material";
import { Fragment, ReactNode, memo } from "react";
import avatarFallback from "../../helpers/avatar_fallback.tsx";
import { useChatroomsDetailGet, useChatroomsDetailMessagesGet } from "../../queries/chat_hooks.ts";
import UserAvatar from "../UserAvatar.tsx";
import { AddRoomDialog } from "./ChatroomMisc.tsx";

function _ChatroomSelection(props: { chatroom_id: number; user_id: number }) {
  const { chatroom_id, user_id } = props;
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
  if (messages != undefined) {
    const page = messages.pages[0];
    if (page != undefined) {
      const last_msg = page[0];
      if (last_msg.message.length !== 0) {
        subheader = last_msg.message;
      } else {
        subheader = "File";
      }
    }
  }

  const users = chatroom.chatroom_users.map((x) => x.user_id);
  const members = users.length;
  let avatar: ReactNode;
  if (chatroom.project_id != null) {
    const img = avatarFallback({ label: chatroom.chatroom_name, seed: chatroom_id });
    avatar = <Avatar src={img} />;
  } else if (members <= 2) {
    const user_to_show = users.filter((x) => x !== user_id)[0] ?? user_id;
    avatar = <UserAvatar user_id={user_to_show} />;
  } else {
    const img = avatarFallback({ label: `${members}`, seed: chatroom_id });
    avatar = <Avatar src={img} />;
  }

  return (
    <>
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
    </>
  );
}

const ChatroomSelection = memo(_ChatroomSelection);

function ChatroomSidebar(props: {
  allowed_rooms: number[];
  user_id: number;
  selectedRoom: number | false;
  onChange: (x: number) => void;
  project_id?: number;
  keyword?: string;
  onChangeKeyword?: (x: string) => void;
}) {
  const { project_id, allowed_rooms, user_id, selectedRoom, onChange, keyword, onChangeKeyword } =
    props;

  return (
    <Stack gap={2}>
      <TextField
        sx={{
          mt: 1,
        }}
        fullWidth
        label={"Cari ruangan"}
        value={keyword ?? ""}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="start">
                <SearchOutlined />
              </InputAdornment>
            ),
          },
        }}
        onChange={(e) => {
          const keyword = e.currentTarget.value;
          if (onChangeKeyword) {
            onChangeKeyword(keyword);
          }
        }}
      />
      <AddRoomDialog user_id={user_id} project_id={project_id} />
      <List>
        {allowed_rooms.map((chatroom_id) => {
          return (
            <Fragment key={chatroom_id}>
              <Divider />
              <ListItem disableGutters>
                <ListItemButton
                  selected={chatroom_id === selectedRoom}
                  onClick={() => {
                    onChange(chatroom_id);
                  }}
                >
                  <ChatroomSelection chatroom_id={chatroom_id} user_id={user_id} />
                </ListItemButton>
              </ListItem>
            </Fragment>
          );
        })}
      </List>
    </Stack>
  );
}

export default ChatroomSidebar;
