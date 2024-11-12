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

export interface MsArticles {
  content: string;
  created_at: Generated<Timestamp>;
  description: string;
  id: Generated<number>;
  name: string;
  user_id: number;
}

export interface MsArticlesLikes {
  article_id: number;
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

export interface MsChatroomFiles {
  content: Buffer;
  filename: string;
  id: Generated<number>;
  message_id: number;
}

export interface MsChatrooms {
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  name: string;
  project_id: number | null;
}

export interface MsComments {
  article_id: number;
  comment: string;
  comment_id: Generated<number>;
  created_at: Generated<Timestamp>;
  user_id: number;
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

export interface MsOtps {
  created_at: Generated<Timestamp>;
  email: string;
  otp: string;
  token: Generated<string>;
  used: Generated<boolean>;
  verified: Generated<boolean>;
}

export interface MsPreferences {
  id: Generated<number>;
  name: string;
}

export interface MsProjectEvents {
  created_at: Generated<Timestamp>;
  event: string;
  id: Generated<number>;
  project_id: number;
}

export interface MsProjects {
  archived: Generated<boolean>;
  content: string | null;
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

export interface MsSuspensions {
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  reason: string;
  suspended_until: Timestamp;
  user_id: number;
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

export interface NotificationEmails {
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  status: string;
  type: string;
  user_id: number;
}

export interface OrgsUsers {
  created_at: Generated<Timestamp>;
  org_id: number;
  role: string;
  user_id: number;
}

export interface PreferencesUsers {
  preference_id: number;
  user_id: number;
  value: string;
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

export interface SocialsUsers {
  created_at: Generated<Timestamp>;
  social: string;
  user_id: number;
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
  ms_articles: MsArticles;
  ms_articles_likes: MsArticlesLikes;
  ms_category_orgs: MsCategoryOrgs;
  ms_category_projects: MsCategoryProjects;
  ms_chatroom_files: MsChatroomFiles;
  ms_chatrooms: MsChatrooms;
  ms_comments: MsComments;
  ms_contributions: MsContributions;
  ms_contributions_users: MsContributionsUsers;
  ms_friends: MsFriends;
  ms_messages: MsMessages;
  ms_notifications: MsNotifications;
  ms_orgs: MsOrgs;
  ms_otps: MsOtps;
  ms_preferences: MsPreferences;
  ms_project_events: MsProjectEvents;
  ms_projects: MsProjects;
  ms_reports: MsReports;
  ms_suspensions: MsSuspensions;
  ms_task_buckets: MsTaskBuckets;
  ms_tasks: MsTasks;
  ms_users: MsUsers;
  notification_emails: NotificationEmails;
  orgs_users: OrgsUsers;
  preferences_users: PreferencesUsers;
  projects_users: ProjectsUsers;
  session: Session;
  socials_users: SocialsUsers;
  tasks_users: TasksUsers;
}
