import { RequestHandler } from "express";
import { deleteSession, getSession, putSession } from "./routes/session";
import { postUser } from "./routes/user";

/**
 * Pasang function-function RequestHandler yang dibuat kesini.
 * Untuk string keynya bebas, usahakan dibuat deskriptif.
 */
type _api = {
  GetSession: typeof getSession;
  PutSession: typeof putSession;
  DeleteSession: typeof deleteSession;
  PostUser: typeof postUser;
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
