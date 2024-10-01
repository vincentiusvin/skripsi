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

export interface MsContributions {
  created_at: Generated<Timestamp>;
  description: string;
  id: Generated<number>;
  name: string;
  project_id: number;
  status: string;
}

export interface MsContributionsUsers {
  contributions_id: Generated<number>;
  user_id: number;
}

export interface MsFriends {
  created_at: Generated<Timestamp>;
  from_user_id: number;
  status: string;
  to_user_id: number;
}

export interface MsMessages {
  chatroom_id: number;
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  is_edited: Generated<boolean>;
  message: string;
  user_id: number;
}

export interface MsNotifications {
  created_at: Generated<Timestamp>;
  description: string;
  id: Generated<number>;
  read: Generated<boolean>;
  title: string;
  type: string;
  type_id: number | null;
  user_id: number;
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
  description: string;
  id: Generated<number>;
  name: string;
  org_id: number;
}

export interface MsReports {
  chatroom_id: number | null;
  created_at: Generated<Timestamp>;
  description: string;
  id: Generated<number>;
  resolution: string | null;
  resolved_at: Timestamp | null;
  sender_id: number;
  status: string;
  title: string;
}

export interface MsTaskBuckets {
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  name: string;
  project_id: number;
}

export interface MsTasks {
  bucket_id: number;
  created_at: Generated<Timestamp>;
  description: string | null;
  end_at: Timestamp | null;
  id: Generated<number>;
  name: string;
  order: number;
  start_at: Timestamp | null;
}

export interface MsUsers {
  about_me: string | null;
  created_at: Generated<Timestamp>;
  education_level: string | null;
  email: string | null;
  id: Generated<number>;
  image: string | null;
  is_admin: Generated<boolean>;
  name: string;
  password: string;
  school: string | null;
}

export interface OrgsUsers {
  created_at: Generated<Timestamp>;
  org_id: number;
  role: string;
  user_id: number;
}

export interface ProjectsUsers {
  created_at: Generated<Timestamp>;
  project_id: number;
  role: string;
  user_id: number;
}

export interface Session {
  expire: Timestamp;
  sess: Json;
  sid: string;
}

export interface TasksUsers {
  created_at: Generated<Timestamp>;
  task_id: number;
  user_id: number;
}

export interface DB {
  categories_orgs: CategoriesOrgs;
  categories_projects: CategoriesProjects;
  chatrooms_users: ChatroomsUsers;
  ms_category_orgs: MsCategoryOrgs;
  ms_category_projects: MsCategoryProjects;
  ms_chatrooms: MsChatrooms;
  ms_contributions: MsContributions;
  ms_contributions_users: MsContributionsUsers;
  ms_friends: MsFriends;
  ms_messages: MsMessages;
  ms_notifications: MsNotifications;
  ms_orgs: MsOrgs;
  ms_projects: MsProjects;
  ms_reports: MsReports;
  ms_task_buckets: MsTaskBuckets;
  ms_tasks: MsTasks;
  ms_users: MsUsers;
  orgs_users: OrgsUsers;
  projects_users: ProjectsUsers;
  session: Session;
  tasks_users: TasksUsers;
}
