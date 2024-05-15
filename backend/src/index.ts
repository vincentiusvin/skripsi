import express, { RequestHandler, json } from "express";
import MySQLStore from "express-mysql-session";
import session, * as _Session from "express-session";
import { dbPool } from "./db/db";
import { getOrgs, postOrgs } from "./routes/orgs";
import { deleteSession, getSession, putSession } from "./routes/session";
import { postUser } from "./routes/user";
import { logger } from "./utils/logger";
import { validateLogged } from "./utils/validate";
const MySQLSessionStore = MySQLStore(_Session);

const app = express();

app.use(logger);

declare module "express-session" {
  interface SessionData {
    user_id?: number;
  }
}

const store = new MySQLSessionStore({}, dbPool);

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(json());

app.get("/api/session", getSession);
app.put("/api/session", putSession);
app.delete("/api/session", deleteSession);

app.get("/api/orgs", getOrgs);
app.post("/api/orgs", validateLogged, postOrgs);

app.post("/api/user", postUser);

app.listen(5000, () => {
  console.log("Server listening on port 5000");
});

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
type ExtractRequestHandler<
  T extends RequestHandler<never, unknown, never, never, never>
> = T extends RequestHandler<
  never,
  infer ResBody,
  infer ReqBody,
  infer ReqQuery,
  never
>
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
