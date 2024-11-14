import { parse, stringify } from "qs";
import { useLocation, useSearch } from "wouter";

export function useSearchParams() {
  const search = useSearch();
  const parsedSearch = parse(search);

  const [location, setLocation] = useLocation();

  function setSearchParams(obj: unknown) {
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

  function setStateSearch(val: T) {
    if (val !== undefined) {
      setSearch({ ...search, [key]: val });
    } else {
      delete search[key];
      setSearch(search);
    }
  }

  return [search[key], setStateSearch] as const;
}
