import BasicPagination from "./Pagination.tsx";
import useQueryPagination from "./QueryPagination/hook.ts";

function QueryPagination(props: { total: number | undefined; limit: number }) {
  const { total, limit } = props;
  const [page, setPage] = useQueryPagination();
  return <BasicPagination limit={limit} page={page} setPage={setPage} total={total} />;
}

export default QueryPagination;
