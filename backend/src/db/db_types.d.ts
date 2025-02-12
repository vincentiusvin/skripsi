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

export interface Articles {
  content: string;
  created_at: Generated<Timestamp>;
  description: string;
  id: Generated<number>;
  image: string | null;
  name: string;
  user_id: number;
}

export interface ArticlesLikes {
  article_id: number;
  created_at: Generated<Timestamp>;
  user_id: number;
}

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

export interface CategoryOrgs {
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  name: string;
}

export interface CategoryProjects {
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  name: string;
}

export interface ChatroomFiles {
  content: Buffer;
  filename: string;
  filetype: string;
  id: Generated<number>;
  message_id: number;
}

export interface Chatrooms {
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  name: string;
  project_id: number | null;
}

export interface ChatroomsUsers {
  chatroom_id: number;
  created_at: Generated<Timestamp>;
  user_id: number;
}

export interface Comments {
  article_id: number;
  comment: string;
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  user_id: number;
}

export interface Contributions {
  created_at: Generated<Timestamp>;
  description: string;
  id: Generated<number>;
  name: string;
  project_id: number;
  status: string;
}

export interface ContributionsUsers {
  contributions_id: number;
  user_id: number;
}

export interface Friends {
  created_at: Generated<Timestamp>;
  from_user_id: number;
  status: string;
  to_user_id: number;
}

export interface Messages {
  chatroom_id: number;
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  is_edited: Generated<boolean>;
  message: string;
  user_id: number;
}

export interface NotificationEmails {
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  status: string;
  type: string;
  user_id: number;
}

export interface Notifications {
  created_at: Generated<Timestamp>;
  description: string;
  id: Generated<number>;
  read: Generated<boolean>;
  title: string;
  type: string;
  type_id: number | null;
  user_id: number;
}

export interface Orgs {
  address: string;
  created_at: Generated<Timestamp>;
  description: string;
  id: Generated<number>;
  image: string | null;
  name: string;
  phone: string;
}

export interface OrgsUsers {
  created_at: Generated<Timestamp>;
  org_id: number;
  role: string;
  user_id: number;
}

export interface Otps {
  created_at: Generated<Timestamp>;
  email: string;
  otp: string;
  token: Generated<string>;
  type: string;
  used_at: Timestamp | null;
  verified_at: Timestamp | null;
}

export interface Preferences {
  id: Generated<number>;
  name: string;
}

export interface PreferencesUsers {
  preference_id: number;
  user_id: number;
  value: string;
}

export interface ProjectEvents {
  created_at: Generated<Timestamp>;
  event: string;
  id: Generated<number>;
  project_id: number;
}

export interface Projects {
  archived: Generated<boolean>;
  content: string | null;
  created_at: Generated<Timestamp>;
  description: string;
  id: Generated<number>;
  name: string;
  org_id: number;
}

export interface ProjectsUsers {
  created_at: Generated<Timestamp>;
  project_id: number;
  role: string;
  user_id: number;
}

export interface Reports {
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

export interface Session {
  expire: Timestamp;
  sess: Json;
  sid: string;
}

export interface SocialsUsers {
  created_at: Generated<Timestamp>;
  social: string;
  user_id: number;
}

export interface Suspensions {
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  reason: string;
  suspended_until: Timestamp;
  user_id: number;
}

export interface TaskBuckets {
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  name: string;
  project_id: number;
}

export interface Tasks {
  bucket_id: number;
  created_at: Generated<Timestamp>;
  description: string | null;
  end_at: Timestamp | null;
  id: Generated<number>;
  name: string;
  order: number;
  start_at: Timestamp | null;
}

export interface TasksUsers {
  created_at: Generated<Timestamp>;
  task_id: number;
  user_id: number;
}

export interface Users {
  about_me: string | null;
  created_at: Generated<Timestamp>;
  education_level: string | null;
  email: string;
  id: Generated<number>;
  image: string | null;
  is_admin: Generated<boolean>;
  location: string | null;
  name: string;
  password: string;
  school: string | null;
  website: string | null;
  workplace: string | null;
}

export interface DB {
  articles: Articles;
  articles_likes: ArticlesLikes;
  categories_orgs: CategoriesOrgs;
  categories_projects: CategoriesProjects;
  category_orgs: CategoryOrgs;
  category_projects: CategoryProjects;
  chatroom_files: ChatroomFiles;
  chatrooms: Chatrooms;
  chatrooms_users: ChatroomsUsers;
  comments: Comments;
  contributions: Contributions;
  contributions_users: ContributionsUsers;
  friends: Friends;
  messages: Messages;
  notification_emails: NotificationEmails;
  notifications: Notifications;
  orgs: Orgs;
  orgs_users: OrgsUsers;
  otps: Otps;
  preferences: Preferences;
  preferences_users: PreferencesUsers;
  project_events: ProjectEvents;
  projects: Projects;
  projects_users: ProjectsUsers;
  reports: Reports;
  session: Session;
  socials_users: SocialsUsers;
  suspensions: Suspensions;
  task_buckets: TaskBuckets;
  tasks: Tasks;
  tasks_users: TasksUsers;
  users: Users;
}
