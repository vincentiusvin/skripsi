import { Skeleton } from "@mui/material";
import { Redirect } from "wouter";
import Chatroom from "../components/Chatroom/Chatroom.tsx";
import { useUsersDetailChatroomsGet } from "../queries/chat_hooks.ts";
import { useSessionGet } from "../queries/sesssion_hooks.ts";

function ChatroomPageAuthorized(props: { user_id: number }) {
  const { user_id } = props;

  const { data: chatrooms } = useUsersDetailChatroomsGet({
    user_id: user_id,
  });

  if (chatrooms == undefined) {
    return <Skeleton />;
  }

  const room_ids = chatrooms.map((x) => x.chatroom_id);

  return <Chatroom allowed_rooms={room_ids} user_id={user_id} />;
}

function ChatroomPage() {
  const { data: sessionData } = useSessionGet();

  if (!sessionData) {
    return <Skeleton />;
  }

  if (sessionData.logged === false) {
    return <Redirect to={"/"} />;
  } else {
    return <ChatroomPageAuthorized user_id={sessionData.user_id} />;
  }
}

export default ChatroomPage;
