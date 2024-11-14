import { useStateSearch } from "../../helpers/search.ts";

function useQueryPagination() {
  const [_page, setPage] = useStateSearch<number>("page");

  let page = Number(_page);
  page = page >= 1 ? page : 1;

  return [page, setPage] as [typeof page, typeof setPage];
}

export default useQueryPagination;
