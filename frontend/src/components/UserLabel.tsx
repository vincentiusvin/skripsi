import { Avatar, Skeleton, Stack, Typography } from "@mui/material";
import { useUsersDetailGet } from "../queries/user_hooks.ts";

function UserLabel(props: { user_id: number }) {
  const { user_id } = props;
  const { data: user } = useUsersDetailGet({ user_id });
  if (!user) {
    return <Skeleton />;
  }

  return (
    <Stack direction={"row"} textOverflow={"ellipsis"} alignItems={"center"} spacing={2}>
      <Avatar src={user.user_image ?? undefined} />
      <Typography>{user.user_name}</Typography>
    </Stack>
  );
}
export default UserLabel;
