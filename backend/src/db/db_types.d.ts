import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export interface Orgs {
  created_at: Generated<Date>;
  description: string;
  id: Generated<number>;
  name: string;
}

export interface OrgsUsers {
  created_at: Generated<Date>;
  orgs_id: number;
  permission: string;
  users_id: number;
}

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
  orgs: Orgs;
  orgs_users: OrgsUsers;
  sessions: Sessions;
  users: Users;
}
