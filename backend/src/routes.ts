import type { Express, RequestHandler } from "express";
import { ExtractRH } from "./helpers/types";
import { validateLogged } from "./helpers/validate";
import {
  getChatroomDetail,
  getChatrooms,
  getMessages,
  postChatrooms,
  postMessages,
  putChatroom,
} from "./routes/chatroom";
import { getOrgDetail, getOrgs, postOrgs } from "./routes/orgs";
import { addProjects, getProjects, getProjectsDetail } from "./routes/projects";
import { deleteSession, getSession, putSession } from "./routes/session";
import { getUser, postUser } from "./routes/user";

export function registerRoutes(app: Express) {
  app.get("/api/session", getSession);
  app.put("/api/session", putSession);
  app.delete("/api/session", deleteSession);

  app.get("/api/orgs", getOrgs);
  app.post("/api/orgs", validateLogged, postOrgs as RequestHandler);
  app.get("/api/orgs/:id", getOrgDetail);

  app.post("/api/users", postUser);
  app.get("/api/users", getUser);

  app.get("/api/chatrooms", validateLogged, getChatrooms as RequestHandler);
  app.post("/api/chatrooms", validateLogged, postChatrooms as RequestHandler);

  app.get("/api/chatrooms/:chatroom_id", validateLogged, getChatroomDetail as RequestHandler);
  app.put("/api/chatrooms/:chatroom_id", validateLogged, putChatroom as RequestHandler);

  app.get("/api/chatrooms/:chatroom_id/messages", validateLogged, getMessages as RequestHandler);
  app.post("/api/chatrooms/:chatroom_id/messages", validateLogged, postMessages as RequestHandler);

  //projects api
  app.get("/api/projects", getProjects);
  app.get("/api/projects/:id", getProjectsDetail);
  app.post("/api/projects", addProjects);
}

/**
 * Pasang function-function RequestHandler yang dibuat kesini.
 * Untuk string keynya bebas, usahakan dibuat deskriptif.
 */
type _api = {
  GetSession: typeof getSession;
  PutSession: typeof putSession;
  DeleteSession: typeof deleteSession;

  GetOrgs: typeof getOrgs;
  PostOrgs: typeof postOrgs;
  GetOrgDetail: typeof getOrgDetail;

  PostUser: typeof postUser;
  GetUser: typeof getUser;

  GetChatrooms: typeof getChatrooms;
  PostChatrooms: typeof postChatrooms;

  GetChatroomDetail: typeof getChatroomDetail;
  PutChatroom: typeof putChatroom;

  GetMessages: typeof getMessages;
  PostMessages: typeof postMessages;

  //projects for front end
  getProjects: typeof getProjects;
  getProjectsDetail: typeof getProjectsDetail;
  addProjects: typeof addProjects;
};

/**
 * Export informasi type pada RequestHandler yang diregister diatas.
 * Cara pakainya dengan akses:
 * API[nama_key_sesuai_diatas]["ResBody" | "ReqBody" | "ReqParams"]
 */
export type API = {
  [K in keyof _api]: ExtractRH<_api[K]>;
};
