import type { Express, RequestHandler } from "express";
import { ExtractRH } from "./helpers/types";
import { validateLogged } from "./helpers/validate";
import { getOrgDetail, getOrgs, postOrgs } from "./routes/orgs";
import { deleteSession, getSession, putSession } from "./routes/session";
import { postUser } from "./routes/user";

export function registerRoutes(app: Express) {
  app.get("/api/session", getSession);
  app.put("/api/session", putSession);
  app.delete("/api/session", deleteSession);

  app.get("/api/orgs", getOrgs);
  app.post("/api/orgs", validateLogged, postOrgs as RequestHandler);
  app.get("/api/orgs/:id", getOrgDetail);

  app.post("/api/users", postUser);
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
  PostOrgs: typeof postOrgs;
  GetOrgs: typeof getOrgs;
  GetOrgDetail: typeof getOrgDetail;
};

/**
 * Export informasi type pada RequestHandler yang diregister diatas.
 * Cara pakainya dengan akses:
 * API[nama_key_sesuai_diatas]["ResBody" | "ReqBody" | "ReqParams"]
 */
export type API = {
  [K in keyof _api]: ExtractRH<_api[K]>;
};
