import { parse, stringify } from "qs";
import { useLocation, useSearch } from "wouter";

export function useSearchParams() {
  const search = useSearch();
  const parsedSearch = parse(search);

  const [location, setLocation] = useLocation();

  function setSearchParams(fn: (prev: typeof parsedSearch) => unknown) {
    const newestSearch = parse(window.location.search, {
      ignoreQueryPrefix: true,
    });

    const obj = fn(newestSearch);

    const queryString = stringify(obj);
    if (queryString.length) {
      setLocation(location + "?" + queryString, {
        replace: true,
      });
    } else {
      setLocation(location, {
        replace: true,
      });
    }
  }

  return [parsedSearch, setSearchParams] as const;
}

export function useStateSearch<T>(key: string) {
  const [search, setSearch] = useSearchParams();

  function setStateSearch(val: T | undefined) {
    if (val !== undefined) {
      setSearch((old) => ({ ...old, [key]: val }));
    } else {
      setSearch((old) => {
        delete old[key];
        return old;
      });
    }
  }

  return [search[key], setStateSearch] as const;
}
