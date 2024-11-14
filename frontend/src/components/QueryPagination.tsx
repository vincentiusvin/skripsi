import { Pagination } from "@mui/material";
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
    <Pagination count={countTotalPages(total, limit)} page={page} onChange={(_, p) => setPage(p)} />
  );
}

export default QueryPagination;
