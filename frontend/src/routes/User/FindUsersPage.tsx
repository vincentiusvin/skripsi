import { Skeleton, Stack, TextField } from "@mui/material";
import UserCard from "../../components/Cards/UserCard.tsx";
import { useSearchParams, useStateSearch } from "../../helpers/search.ts";
import { useUsersGet } from "../../queries/user_hooks.ts";

function FindUsers() {
  const search = useSearchParams();
  const [keyword, setKeyword] = useStateSearch("keyword", search);
  const { data: users } = useUsersGet({
    keyword: keyword?.toString(),
  });

  return (
    <Stack spacing={2}>
      <TextField
        value={keyword ?? ""}
        label="Username"
        onChange={(e) => {
          setKeyword(e.target.value);
        }}
      />
      {users != undefined ? (
        users.map((x) => <UserCard user_id={x.user_id} key={x.user_id} />)
      ) : (
        <Skeleton />
      )}
    </Stack>
  );
}

function FindUsersPage() {
  return <FindUsers />;
}

export default FindUsersPage;
