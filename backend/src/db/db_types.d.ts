import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Json = JsonValue;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Orgs {
  address: string;
  created_at: Generated<Timestamp>;
  description: string;
  id: Generated<number>;
  name: string;
  phone: string;
}

export interface OrgsUsers {
  created_at: Generated<Timestamp>;
  orgs_id: number;
  permission: string;
  users_id: number;
}

export interface Session {
  expire: Timestamp;
  sess: Json;
  sid: string;
}

export interface Users {
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  name: string;
  password: string;
}

export interface DB {
  orgs: Orgs;
  orgs_users: OrgsUsers;
  session: Session;
  users: Users;
}
