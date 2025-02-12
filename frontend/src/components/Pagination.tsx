import { Pagination, Stack, Typography } from "@mui/material";

function countTotalPages(total: number | undefined, limit: number) {
  if (total == undefined) {
    return -1;
  }
  return Math.ceil(total / limit);
}

function BasicPagination(props: {
  total: number | undefined;
  limit: number;
  page: number;
  setPage: (x: number) => void;
}) {
  const { total, limit, page, setPage } = props;
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
export default BasicPagination;
