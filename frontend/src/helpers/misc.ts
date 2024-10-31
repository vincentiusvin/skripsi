import { useState } from "react";

export function useList<T>(init: T[]) {
  const [list, setList] = useState(init);

  function push(x: T) {
    setList((old) => [...old, x]);
  }

  function removeAt(idx: number) {
    setList((old) => old.filter((_, i) => i !== idx));
  }

  function set(x: T[]) {
    setList(x);
  }

  function insertAt(idx: number, elem: T) {
    setList((old) => old.flatMap((x, i) => (i !== idx ? x : [elem, x])));
  }

  function updateAt(idx: number, elem: T) {
    setList((old) => old.map((x, i) => (i !== idx ? x : elem)));
  }

  return [
    list,
    {
      push,
      removeAt,
      set,
      insertAt,
      updateAt,
    },
  ] as const;
}
