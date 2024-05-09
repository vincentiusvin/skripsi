import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export interface Sessions {
  data: Generated<string | null>;
  expires: number;
  session_id: string;
}

export interface Users {
  created_at: Generated<Date>;
  id: Generated<number>;
  name: string;
  password: string;
}

export interface DB {
  sessions: Sessions;
  users: Users;
}
