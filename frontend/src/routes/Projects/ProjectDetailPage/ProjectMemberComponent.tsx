import { Avatar, Skeleton, Stack, Typography } from "@mui/material";
import { useProjectsDetailMembersGet } from "../../../queries/project_hooks.ts";
import { useUserAccountDetailGet } from "../../../queries/user_hooks.ts";

function ProjectMember(props: { user_id: number; project_id: number }) {
  const { user_id, project_id } = props;
  const { data: user_data } = useUserAccountDetailGet({
    user_id,
  });
  const { data: member_data } = useProjectsDetailMembersGet({
    user_id,
    project_id,
  });

  if (!user_data || !member_data) {
    return (
      <Stack direction={"row"} alignItems={"center"} gap={2}>
        <Avatar src={undefined}></Avatar>
        <Skeleton width={"100%"}></Skeleton>
      </Stack>
    );
  }
  return (
    <Stack direction={"row"} alignItems={"center"} gap={2}>
      <Avatar src={user_data.user_image ?? undefined}></Avatar>
      <Stack>
        <Typography>{user_data.user_name}</Typography>
        <Typography variant="body2" color={"GrayText"}>
          {member_data.role}
        </Typography>
      </Stack>
    </Stack>
  );
}

export default ProjectMember;
