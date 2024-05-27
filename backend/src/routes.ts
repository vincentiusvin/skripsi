import type { Express, RequestHandler } from "express";
import { ExtractRH } from "./helpers/types";
import { validateLogged } from "./helpers/validate";
import {
  getChatroomsDetail,
  getChatroomsDetailMessages,
  getProjectsDetailChatrooms,
  getUsersDetailChatrooms,
  postChatroomsDetailMessages,
  postProjectsDetailChatrooms,
  postUsersDetailChatrooms,
  putChatroomsDetail,
} from "./routes/chatroom";
import {
  deleteOrgs,
  getOrgs,
  getOrgsCategories,
  getOrgsDetail,
  postOrgs,
  updateOrgs,
} from "./routes/orgs";
import {
  deleteProjectsDetailMembersDetail,
  getProjects,
  getProjectsCategories,
  getProjectsDetail,
  getProjectsDetailMembersDetail,
  postProjects,
  putProjectsDetailMembersDetail,
} from "./routes/projects";
import { deleteSession, getSession, putSession } from "./routes/session";
import { getUser, postUser } from "./routes/user";

export function registerRoutes(app: Express) {
  // session -> RUD
  app.get("/api/session", getSession); // R
  app.put("/api/session", putSession); // U
  app.delete("/api/session", deleteSession); // D

  // users -> CR
  app.post("/api/users", postUser); // C
  app.get("/api/users", getUser); // R
  // users/user -> RUD
  // R
  // U
  // D
  // users/user/chatrooms -> CR
  app.post(
    "/api/users/:user_id/chatrooms",
    validateLogged,
    postUsersDetailChatrooms as RequestHandler,
  ); // C
  app.get(
    "/api/users/:user_id/chatrooms",
    validateLogged,
    getUsersDetailChatrooms as RequestHandler,
  ); // R

  // orgs -> CR
  app.post("/api/orgs", validateLogged, postOrgs as RequestHandler); // C
  app.get("/api/orgs", getOrgs); // R
  // orgs/org -> RUD
  app.get("/api/orgs/:id", getOrgsDetail); // R
  // Update Orgs
  app.put("/api/orgs", updateOrgs); //U
  app.delete("/api/orgs", deleteOrgs); // D
  // org-categories -> R
  app.get("/api/org-categories", getOrgsCategories); // R

  // projects -> CR
  app.post("/api/projects", postProjects); // C
  app.get("/api/projects", getProjects); // R
  // projects/project -> RUD
  app.get("/api/projects/:project_id", getProjectsDetail); // R
  // U
  // D
  // projects/project/users -> shallow
  // projects/project/users/user -> RUD
  app.get("/api/projects/:project_id/users/:user_id", getProjectsDetailMembersDetail); // R
  app.put("/api/projects/:project_id/users/:user_id", putProjectsDetailMembersDetail); // U
  app.delete("/api/projects/:project_id/users/:user_id", deleteProjectsDetailMembersDetail); // D
  // projects/project/chatrooms -> CR
  app.post(
    "/api/projects/:project_id/chatrooms",
    validateLogged,
    postProjectsDetailChatrooms as RequestHandler,
  ); // C
  app.get("/api/projects/:project_id/chatrooms", getProjectsDetailChatrooms); //  R
  // projects/project-categories
  app.get("/api/project-categories", getProjectsCategories);

  // chatrooms -> shallow
  // chatrooms/chatroom -> RUD
  app.get("/api/chatrooms/:chatroom_id", validateLogged, getChatroomsDetail as RequestHandler); // R
  app.put("/api/chatrooms/:chatroom_id", validateLogged, putChatroomsDetail as RequestHandler); // U
  // D
  // chatrooms/chatroom/messages -> CR
  app.post(
    "/api/chatrooms/:chatroom_id/messages",
    validateLogged,
    postChatroomsDetailMessages as RequestHandler,
  ); // C
  app.get(
    "/api/chatrooms/:chatroom_id/messages",
    validateLogged,
    getChatroomsDetailMessages as RequestHandler,
  ); // R
}

/**
 * Pasang function-function RequestHandler yang dibuat kesini.
 * Untuk string keynya bebas, usahakan dibuat deskriptif.
 */
type _api = {
  SessionGet: typeof getSession;
  SessionPut: typeof putSession;
  SessionDelete: typeof deleteSession;

  UsersPost: typeof postUser;
  UsersGet: typeof getUser;
  UsersDetailChatroomsPost: typeof postUsersDetailChatrooms;
  UsersDetailChatroomsGet: typeof getUsersDetailChatrooms;

  OrgsPost: typeof postOrgs;
  OrgsGet: typeof getOrgs;
  OrgsDetailGet: typeof getOrgsDetail;
  OrgsCategoriesGet: typeof getOrgsCategories;
  OrgsUpdate: typeof updateOrgs;

  ProjectsPost: typeof postProjects;
  ProjectsGet: typeof getProjects;
  ProjectsDetailGet: typeof getProjectsDetail;
  ProjectsDetailMembersGet: typeof getProjectsDetailMembersDetail;
  ProjectsDetailMembersPut: typeof putProjectsDetailMembersDetail;
  ProjectsDetailMembersDelete: typeof deleteProjectsDetailMembersDetail;
  ProjectsDetailChatroomsPost: typeof postProjectsDetailChatrooms;
  ProjectsDetailChatroomsGet: typeof getProjectsDetailChatrooms;
  ProjectsCategoriesGet: typeof getProjectsCategories;

  ChatroomsDetailGet: typeof getChatroomsDetail;
  ChatroomsDetailPut: typeof putChatroomsDetail;
  ChatroomsDetailMessagesGet: typeof getChatroomsDetailMessages;
  ChatroomsDetailMessagesPost: typeof postChatroomsDetailMessages;
};

/**
 * Export informasi type pada RequestHandler yang diregister diatas.
 * Cara pakainya dengan akses:
 * API[nama_key_sesuai_diatas]["ResBody" | "ReqBody" | "ReqParams"]
 */
export type API = {
  [K in keyof _api]: ExtractRH<_api[K]>;
};
