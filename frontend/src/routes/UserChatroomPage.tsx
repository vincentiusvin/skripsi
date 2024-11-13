import { Skeleton } from "@mui/material";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { Redirect } from "wouter";
import Chatroom from "../components/Chatroom/Chatroom.tsx";
import { useUsersDetailChatroomsGet } from "../queries/chat_hooks.ts";
import { useSessionGet } from "../queries/sesssion_hooks.ts";

function ChatroomPageAuthorized(props: { user_id: number }) {
  const { user_id } = props;

  const [keyword, setKeyword] = useState<string | undefined>(undefined);
  const [debouncedKeyword] = useDebounce(keyword, 300);
  const { data: chatrooms } = useUsersDetailChatroomsGet({
    user_id: user_id,
    keyword: debouncedKeyword,
  });

  const room_ids = chatrooms?.map((x) => x.chatroom_id) ?? [];

  return (
    <Chatroom
      keyword={keyword}
      onChangeKeyword={(x) => setKeyword(x)}
      allowed_rooms={room_ids}
      user_id={user_id}
    />
  );
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
