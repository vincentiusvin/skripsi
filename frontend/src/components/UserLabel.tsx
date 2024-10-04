import { Avatar, Skeleton, Stack, Typography } from "@mui/material";
import { useUsersDetailGet } from "../queries/user_hooks.ts";
import StyledLink from "./StyledLink.tsx";

function UserLabel(props: { user_id: number }) {
  const { user_id } = props;
  const { data: user } = useUsersDetailGet({ user_id });
  if (!user) {
    return <Skeleton />;
  }

  return (
    <StyledLink to={`/users/${user.user_id}`}>
      <Stack direction={"row"} textOverflow={"ellipsis"} alignItems={"center"} spacing={2}>
        <Avatar src={user.user_image ?? undefined} />
        <Typography>{user.user_name}</Typography>
      </Stack>
    </StyledLink>
  );
}
export default UserLabel;
