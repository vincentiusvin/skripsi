import { RequestHandler } from "express";
import { getTest } from "./routes/test";
import { postTest } from "./routes/test2";

/**
 * Pasang function-function RequestHandler yang dibuat kesini.
 * Untuk string keynya bebas, usahakan dibuat deskriptif.
 */
type _api = {
  "POST /api/test": typeof postTest;
  "GET /api/test": typeof getTest;
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
> = {
  ResBody: T extends RequestHandler<never, infer ResBody, never, never, never>
    ? ResBody
    : never;
  ReqBody: T extends RequestHandler<never, unknown, infer ReqBody, never, never>
    ? ReqBody
    : never;
  ReqQuery: T extends RequestHandler<
    never,
    unknown,
    never,
    infer ReqQuery,
    never
  >
    ? ReqQuery
    : never;
};

/**
 * Export informasi type pada RequestHandler yang diregister diatas.
 * Cara pakainya dengan akses:
 * API[nama_key_sesuai_diatas]["ResBody" | "ReqBody" | "ReqParams"]
 */
export type API = {
  [K in keyof _api]: ExtractRequestHandler<_api[K]>;
};
