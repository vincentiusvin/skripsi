import { Skeleton } from "@mui/material";
import { stringify } from "qs";
import { Redirect, useLocation, useParams } from "wouter";
import { APIError } from "../helpers/fetch.ts";
import { useChatroomsDetailGet } from "../queries/chat_hooks.ts";
import { useSessionGet } from "../queries/sesssion_hooks.ts";

function RedirectBack() {
  return <Redirect to={"/"} />;
}

function ChatroomForwarder(props: { chatroom_id: number }) {
  const { chatroom_id } = props;
  const [, setLocation] = useLocation();
  const { data: room } = useChatroomsDetailGet({
    chatroom_id,
    retry: (failureCount, error) => {
      if (
        (error instanceof APIError && (error.status === 401 || error.status === 404)) ||
        failureCount > 3
      ) {
        setLocation("/");
        return false;
      }
      return true;
    },
  });

  const chatroom_params = stringify(
    {
      room: chatroom_id,
    },
    {
      addQueryPrefix: true,
    },
  );

  if (room == undefined) {
    return <Skeleton />;
  }

  if (room.project_id) {
    return <Redirect to={`/projects/${room.project_id}/chat${chatroom_params}`} />;
  } else {
    return <Redirect to={`/chatrooms${chatroom_params}`} />;
  }
}

function ChatroomForwarderPage() {
  const { data: sessionData } = useSessionGet();

  const { chatroom_id: id } = useParams();
  const chatroom_id = Number(id);
  if (isNaN(chatroom_id)) {
    return <RedirectBack />;
  }

  if (!sessionData) {
    return <Skeleton />;
  }
  if (sessionData.logged === false) {
    return <RedirectBack />;
  }

  return <ChatroomForwarder chatroom_id={chatroom_id} />;
}

export default ChatroomForwarderPage;
