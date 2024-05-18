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

export interface CategoriesOrgs {
  category_id: number;
  created_at: Generated<Timestamp>;
  org_id: number;
}

export interface CategoriesProjects {
  category_id: number;
  created_at: Generated<Timestamp>;
  project_id: number;
}

export interface ChatroomsUsers {
  chatroom_id: number;
  created_at: Generated<Timestamp>;
  user_id: number;
}

export interface MsCategoryOrgs {
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  name: string;
}

export interface MsCategoryProjects {
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  name: string;
}

export interface MsChatrooms {
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  name: string;
  project_id: number | null;
}

export interface MsMessages {
  chatroom_id: number;
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  message: string;
  users_id: number;
}

export interface MsOrgs {
  address: string;
  created_at: Generated<Timestamp>;
  description: string;
  id: Generated<number>;
  image: string | null;
  name: string;
  phone: string;
}

export interface MsProjects {
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  name: string;
  org_id: number;
}

export interface MsUsers {
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  name: string;
  password: string;
}

export interface OrgsUsers {
  created_at: Generated<Timestamp>;
  org_id: number;
  permission: string;
  user_id: number;
}

export interface ProjectsUsers {
  created_at: Generated<Timestamp>;
  project_id: number;
  user_id: number;
}

export interface Session {
  expire: Timestamp;
  sess: Json;
  sid: string;
}

export interface DB {
  categories_orgs: CategoriesOrgs;
  categories_projects: CategoriesProjects;
  chatrooms_users: ChatroomsUsers;
  ms_category_orgs: MsCategoryOrgs;
  ms_category_projects: MsCategoryProjects;
  ms_chatrooms: MsChatrooms;
  ms_messages: MsMessages;
  ms_orgs: MsOrgs;
  ms_projects: MsProjects;
  ms_users: MsUsers;
  orgs_users: OrgsUsers;
  projects_users: ProjectsUsers;
  session: Session;
}
