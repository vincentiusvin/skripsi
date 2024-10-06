import { Skeleton, Stack } from "@mui/material";
import UserCard from "../../components/Cards/UserCard.tsx";
import { useUsersGet } from "../../queries/user_hooks.ts";

function FindUsers() {
  const { data: users } = useUsersGet();
  if (users == undefined) {
    return <Skeleton />;
  }
  return (
    <Stack spacing={2}>
      {users.map((x) => (
        <UserCard user_id={x.user_id} key={x.user_id} />
      ))}
    </Stack>
  );
}

function FindUsersPage() {
  return <FindUsers />;
}

export default FindUsersPage;
