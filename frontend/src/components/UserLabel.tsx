import { Skeleton, Stack, Typography } from "@mui/material";
import { useUsersDetailGet } from "../queries/user_hooks.ts";
import UserAvatar from "./UserAvatar.tsx";

function UserLabel(props: { user_id: number; disableImage?: boolean; disableName?: boolean }) {
  const { user_id, disableImage, disableName } = props;
  const { data: user } = useUsersDetailGet({ user_id });
  if (!user) {
    return <Skeleton />;
  }

  return (
    <Stack direction={"row"} textOverflow={"ellipsis"} alignItems={"center"} spacing={2}>
      {!disableImage ? <UserAvatar user_id={user_id} /> : null}
      {!disableName ? <Typography>{user.user_name}</Typography> : null}
    </Stack>
  );
}
export default UserLabel;
