import { SearchOutlined } from "@mui/icons-material";
import { InputAdornment, Skeleton, Stack, TextField, Typography } from "@mui/material";
import { useDebounce } from "use-debounce";
import UserCard from "../../components/Cards/UserCard.tsx";
import { useStateSearch } from "../../helpers/search.ts";
import { useUsersGet } from "../../queries/user_hooks.ts";

function FindUsers() {
  const [keyword, setKeyword] = useStateSearch("keyword");
  const [debouncedKeyword] = useDebounce(keyword, 300);
  const { data: users_raw } = useUsersGet({
    keyword: debouncedKeyword?.toString(),
  });
  const users = users_raw?.result;

  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={"bold"} textAlign={"center"}>
        Daftar Pengguna
      </Typography>
      <TextField
        value={keyword ?? ""}
        label="Cari pengguna"
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="start">
                <SearchOutlined />
              </InputAdornment>
            ),
          },
        }}
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
