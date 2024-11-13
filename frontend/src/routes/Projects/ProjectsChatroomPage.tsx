import { Skeleton } from "@mui/material";
import { useParams } from "wouter";
import Chatroom from "../../components/Chatroom/Chatroom.tsx";
import { useProjectsDetailChatroomsGet } from "../../queries/chat_hooks.ts";
import { useSessionGet } from "../../queries/sesssion_hooks.ts";
import AuthorizeProjects, { RedirectBack } from "./components/AuthorizeProjects.tsx";

function ProjectChatroom(props: { user_id: number; project_id: number }) {
  const { project_id, user_id } = props;
  const { data: chatrooms } = useProjectsDetailChatroomsGet({ project_id });

  if (chatrooms == undefined) {
    return <Skeleton />;
  }

  const room_ids = chatrooms.map((x) => x.chatroom_id);

  return <Chatroom project_id={project_id} user_id={user_id} allowed_rooms={room_ids} />;
}

function ProjectsChatroomPage() {
  const { project_id: id } = useParams();
  const project_id = Number(id);

  const { data: user_data } = useSessionGet();

  if (!user_data) {
    return <Skeleton />;
  }

  if (!user_data.logged) {
    return <RedirectBack />;
  }

  return (
    <AuthorizeProjects allowedRoles={["Admin", "Dev"]}>
      <ProjectChatroom project_id={project_id} user_id={user_data.user_id} />
    </AuthorizeProjects>
  );
}

export default ProjectsChatroomPage;
