import { Avatar, Skeleton, Stack, Typography } from "@mui/material";
import { useFriendsDetailGet, useFriendsGet } from "../../queries/friend_hooks.ts";
import { useSessionGet } from "../../queries/sesssion_hooks.ts";
import { useUsersDetailGet } from "../../queries/user_hooks.ts";

function UserFriendPage() {
  const { data: session_data } = useSessionGet();

  if (!session_data) {
    return <Skeleton />;
  }

  if (session_data.logged) {
    return <UserLoggedIn user_id={session_data.user_id} />;
  }

  return <Stack></Stack>;
}

function UserLoggedIn(props: { user_id: number }) {
  const { user_id } = props;
  const { data: friends } = useFriendsGet({ user_id });

  if (!friends) {
    return <Skeleton />;
  }

  return (
    <Stack>
      {friends.map((x) => (
        <UserCard key={x.user_id} user_id={user_id} with_id={x.user_id} />
      ))}
    </Stack>
  );
}

function UserCard(props: { user_id: number; with_id: number }) {
  const { with_id, user_id } = props;
  const { data: user_data } = useUsersDetailGet({ user_id: with_id });
  const { data: friend_data } = useFriendsDetailGet({
    user_id,
    with_id,
  });

  if (!user_data || !friend_data) {
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
          {friend_data.status}
        </Typography>
      </Stack>
    </Stack>
  );
}

export default UserFriendPage;
