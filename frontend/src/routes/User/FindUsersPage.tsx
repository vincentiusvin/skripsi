import { SearchOutlined } from "@mui/icons-material";
import { InputAdornment, Skeleton, Stack, TextField, Typography } from "@mui/material";
import { useDebounce } from "use-debounce";
import UserCard from "../../components/Cards/UserCard.tsx";
import QueryPagination from "../../components/QueryPagination.tsx";
import useQueryPagination from "../../components/QueryPagination/hook.ts";
import { useStateSearch } from "../../helpers/search.ts";
import { useUsersGet } from "../../queries/user_hooks.ts";

function FindUsers() {
  const [keyword, setKeyword] = useStateSearch("keyword");
  const [debouncedKeyword] = useDebounce(keyword, 300);
  const [page, setPage] = useQueryPagination();
  const limit = 10;
  const { data: users_raw } = useUsersGet({
    keyword: debouncedKeyword?.toString(),
    page,
    limit,
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
          setPage(1);
        }}
      />
      {users != undefined ? (
        users.map((x) => <UserCard user_id={x.user_id} key={x.user_id} />)
      ) : (
        <Skeleton />
      )}
      <QueryPagination limit={limit} total={users_raw?.total} />
    </Stack>
  );
}

function FindUsersPage() {
  return <FindUsers />;
}

export default FindUsersPage;
