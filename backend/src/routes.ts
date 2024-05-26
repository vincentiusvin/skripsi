import type { Express, RequestHandler } from "express";
import { ExtractRH } from "./helpers/types";
import { validateLogged } from "./helpers/validate";
import {
  getChatroomDetail,
  getMessages,
  getPersonalChatrooms,
  getProjectChatrooms,
  postMessages,
  postPersonalChatrooms,
  postProjectChatroom,
  putChatroom,
} from "./routes/chatroom";
import { getOrgDetail, getOrgs, getOrgsCategory, postOrgs } from "./routes/orgs";
import {
  addProjectMember,
  addProjects,
  deleteProjectMember,
  getProjectCategory,
  getProjectMembership,
  getProjects,
  getProjectsDetail,
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
    postPersonalChatrooms as RequestHandler,
  ); // C
  app.get("/api/users/:user_id/chatrooms", validateLogged, getPersonalChatrooms as RequestHandler); // R

  // orgs -> CR
  app.post("/api/orgs", validateLogged, postOrgs as RequestHandler); // C
  app.get("/api/orgs", getOrgs); // R
  // orgs/org -> RUD
  app.get("/api/orgs/:id", getOrgDetail); // R
  // U
  // D
  // org-categories -> R
  app.get("/api/category", getOrgsCategory); // R

  // projects -> CR
  app.post("/api/projects", addProjects); // C
  app.get("/api/projects", getProjects); // R
  // projects/project -> RUD
  app.get("/api/projects/:project_id", getProjectsDetail); // R
  // U
  // D
  // projects/project/users -> shallow
  // projects/project/users/user -> RUD
  app.get("/api/projects/:project_id/users/:user_id", getProjectMembership); // R
  app.put("/api/projects/:project_id/users/:user_id", addProjectMember); // U
  app.delete("/api/projects/:project_id/users/:user_id", deleteProjectMember); // D
  // projects/project/chatrooms -> CR
  app.post(
    "/api/projects/:project_id/chatrooms",
    validateLogged,
    postProjectChatroom as RequestHandler,
  ); // C
  app.get("/api/projects/:project_id/chatrooms", getProjectChatrooms); //  R
  // projects/project-categories
  app.get("/api/projects-category", getProjectCategory);

  // chatrooms -> shallow
  // chatrooms/chatroom -> RUD
  app.get("/api/chatrooms/:chatroom_id", validateLogged, getChatroomDetail as RequestHandler); // R
  app.put("/api/chatrooms/:chatroom_id", validateLogged, putChatroom as RequestHandler); // U
  // D
  // chatrooms/chatroom/messages -> CR
  app.post("/api/chatrooms/:chatroom_id/messages", validateLogged, postMessages as RequestHandler); // C
  app.get("/api/chatrooms/:chatroom_id/messages", validateLogged, getMessages as RequestHandler); // R
}

/**
 * Pasang function-function RequestHandler yang dibuat kesini.
 * Untuk string keynya bebas, usahakan dibuat deskriptif.
 */
type _api = {
  SessionGet: typeof getSession;
  SessionPut: typeof putSession;
  SessionDelete: typeof deleteSession;

  UserPost: typeof postUser;
  UserGet: typeof getUser;
  UserDetailChatroomPost: typeof postPersonalChatrooms;
  UserDetailChatroomGet: typeof getPersonalChatrooms;

  OrgsPost: typeof postOrgs;
  OrgsGet: typeof getOrgs;
  OrgsDetailGet: typeof getOrgDetail;
  OrgsCategoriesGet: typeof getOrgsCategory;

  ProjectsPost: typeof addProjects;
  ProjectsGet: typeof getProjects;
  ProjectsDetailGet: typeof getProjectsDetail;
  ProjectsDetailMembersGet: typeof getProjectMembership;
  ProjectsDetailMembersPut: typeof addProjectMember;
  ProjectsDetailMembersDelete: typeof deleteProjectMember;
  ProjectsDetailChatroomsPost: typeof postProjectChatroom;
  ProjectsDetailChatroomsGet: typeof getProjectChatrooms;
  ProjectsCategoriesGet: typeof getProjectCategory;

  ChatroomsDetailGet: typeof getChatroomDetail;
  ChatroomsDetailPut: typeof putChatroom;
  ChatroomsDetailMessagesGet: typeof getMessages;
  ChatroomsDetailMessagesPost: typeof postMessages;
};

/**
 * Export informasi type pada RequestHandler yang diregister diatas.
 * Cara pakainya dengan akses:
 * API[nama_key_sesuai_diatas]["ResBody" | "ReqBody" | "ReqParams"]
 */
export type API = {
  [K in keyof _api]: ExtractRH<_api[K]>;
};
