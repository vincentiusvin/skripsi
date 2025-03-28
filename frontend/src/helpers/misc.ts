import dayjs from "dayjs";
import { useState } from "react";

export function restrictToEnum<T extends Readonly<unknown[]>>(
  obj: unknown,
  options: T,
): obj is T[number] {
  return options.includes(obj as T[number]);
}

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

/**
 * Buat handle value yang disimpan secara opsional di db.
 * Kalau undefined artinya kita gak ubah.
 * Kalau string kosong kita jadiin null, karena string yang dikirim ke backend ga boleh length 0.
 * Kalau ada isinya ya kita kirim langsung
 * @param x - String to check
 * @returns
 */
export function handleOptionalStringUpdate(x: string | undefined): string | null | undefined {
  if (x === undefined) {
    return undefined;
  }
  if (x.length === 0) {
    return null;
  }
  return x;
}

/**
 * Buat handle value yang disimpan secara opsional di db yang gak terima null.
 * Kalau undefined artinya kita gak ubah.
 * Kalau string kosong kita jadiin undefined, karena string yang dikirim ke backend ga boleh length 0.
 * Kalau ada isinya ya kita kirim langsung
 * @param x - String to check
 * @returns
 */
export function handleOptionalStringCreation(x: string | undefined): string | undefined {
  if (x === undefined) {
    return undefined;
  }
  if (x.length === 0) {
    return undefined;
  }
  return x;
}

export function formatTimeLong(x: Date | string | dayjs.Dayjs) {
  return dayjs(x).format("dddd[,] D MMM YYYY[,] HH:mm");
}

export function formatTimeShort(x: Date | string | dayjs.Dayjs) {
  return dayjs(x).format("dddd[,] D MMM YYYY");
}
