import { useSearchParams, useStateSearch } from "../../helpers/search.ts";

function useQueryPagination() {
  const paramsHook = useSearchParams();
  const [_page, setPage] = useStateSearch<number>("page", paramsHook);

  let page = Number(_page);
  page = page >= 1 ? page : 1;

  return [page, setPage] as [number, (x: number) => void];
}

export default useQueryPagination;
