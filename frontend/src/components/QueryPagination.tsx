import { Pagination, Stack, Typography } from "@mui/material";
import useQueryPagination from "./QueryPagination/hook.ts";

function countTotalPages(total: number | undefined, limit: number) {
  if (total == undefined) {
    return -1;
  }
  return Math.ceil(total / limit);
}

function QueryPagination(props: { total: number | undefined; limit: number }) {
  const { total, limit } = props;
  const [page, setPage] = useQueryPagination();
  return (
    <Stack alignItems={"center"} spacing={1}>
      <Typography>Ditemukan {total} hasil</Typography>
      <Pagination
        showFirstButton
        showLastButton
        sx={{
          margin: "auto",
        }}
        count={countTotalPages(total, limit)}
        page={page}
        onChange={(_, p) => setPage(p)}
      />
    </Stack>
  );
}

export default QueryPagination;
