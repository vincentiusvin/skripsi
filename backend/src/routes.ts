import type { Express } from "express";
import { validateLogged } from "./helpers/validate";
import { getOrgDetail, getOrgs, postOrgs } from "./routes/orgs";
import { deleteSession, getSession, putSession } from "./routes/session";
import { postUser } from "./routes/user";
import { RH } from "./template";

export function registerRoutes(app: Express) {
  app.get("/api/session", getSession);
  app.put("/api/session", putSession);
  app.delete("/api/session", deleteSession);

  app.get("/api/orgs", getOrgs);
  app.post("/api/orgs", validateLogged, postOrgs);
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
 * RequestHandler itu fungsi.
 *
 * Params, ReqBody, ReqQuery, dan Locals itu properti di parameter fungsi.
 * Mereka contravariant terhadap generic kita.
 *
 * ResBody beda sendiri, dia itu parameter di method pada parameter fungsi
 * Dia covariant terhadap generic kita
 */
type ExtractRequestHandler<T extends RH<never, unknown, never, never, never>> =
  T extends RH<never, infer ResBody, infer ReqBody, infer ReqQuery, never>
    ? { ResBody: ResBody; ReqBody: ReqBody; ReqQuery: ReqQuery }
    : { ResBody: never; ReqBody: never; ReqQuery: never };

/**
 * Export informasi type pada RequestHandler yang diregister diatas.
 * Cara pakainya dengan akses:
 * API[nama_key_sesuai_diatas]["ResBody" | "ReqBody" | "ReqParams"]
 */
export type API = {
  [K in keyof _api]: ExtractRequestHandler<_api[K]>;
};
