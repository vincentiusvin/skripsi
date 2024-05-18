import type { Express, RequestHandler } from "express";
import { Server } from "socket.io";
import { ExtractRH } from "./helpers/types";
import { validateLogged } from "./helpers/validate";
import {
  getChatroomDetail,
  getChatrooms,
  postChatrooms,
  putChatroom,
  registerSocket,
} from "./routes/chatroom";
import { getOrgDetail, getOrgs, postOrgs } from "./routes/orgs";
import { deleteSession, getSession, putSession } from "./routes/session";
import { getUser, postUser } from "./routes/user";

export function registerRoutes(app: Express, io: Server) {
  app.get("/api/session", getSession);
  app.put("/api/session", putSession);
  app.delete("/api/session", deleteSession);

  app.get("/api/orgs", getOrgs);
  app.post("/api/orgs", validateLogged, postOrgs as RequestHandler);
  app.get("/api/orgs/:id", getOrgDetail);

  app.post("/api/users", postUser);
  app.get("/api/users", getUser);

  app.get("/api/chatrooms", validateLogged, getChatrooms as RequestHandler);
  app.get("/api/chatrooms/:chatroom_id", validateLogged, getChatroomDetail as RequestHandler);
  app.put("/api/chatrooms/:chatroom_id", validateLogged, putChatroom as RequestHandler);
  app.post("/api/chatrooms", validateLogged, postChatrooms as RequestHandler);

  io.on("connection", (socket) => registerSocket(io, socket));
}

/**
 * Pasang function-function RequestHandler yang dibuat kesini.
 * Untuk string keynya bebas, usahakan dibuat deskriptif.
 */
type _api = {
  GetSession: typeof getSession;
  PutSession: typeof putSession;
  DeleteSession: typeof deleteSession;
  PostUser: typeof postUser;
  GetUser: typeof getUser;
  PostOrgs: typeof postOrgs;
  GetOrgs: typeof getOrgs;
  GetOrgDetail: typeof getOrgDetail;
  GetChatrooms: typeof getChatrooms;
  PostChatrooms: typeof postChatrooms;
  GetChatroomDetail: typeof getChatroomDetail;
};

/**
 * Export informasi type pada RequestHandler yang diregister diatas.
 * Cara pakainya dengan akses:
 * API[nama_key_sesuai_diatas]["ResBody" | "ReqBody" | "ReqParams"]
 */
export type API = {
  [K in keyof _api]: ExtractRH<_api[K]>;
};
