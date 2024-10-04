import { RequestHandler } from "express";
import { ZodTypeAny, z } from "zod";

export type APISchema<
  ZParams extends ZodTypeAny = ZodTypeAny,
  ZResBody extends ZodTypeAny = ZodTypeAny,
  ZReqBody extends ZodTypeAny = ZodTypeAny,
  ZReqQuery extends ZodTypeAny = ZodTypeAny,
> = {
  // Param itu data kiriman yang ada di pathnya, http://website/api/user/1.
  Params?: ZParams;
  // ResBody itu jawaban dari server. Declare untuk request yang sukses aja.
  // Request gagal formatnya bakal pakai {msg: string} tapi ga usah dimasukkin ke sini.
  // Kalau request sukses formatnya {msg: string} silahkan ditaruh disini.
  ResBody: ZResBody;
  // ReqBody itu data kiriman yang dtaruh di body, bukan di url.
  ReqBody?: ZReqBody;
  // ReqQuery itu data yang ada habis path, http://website/api/items?page=1
  ReqQuery?: ZReqQuery;
};

export type RequestHandlerFromSchema<S extends APISchema> = RequestHandler<
  S["Params"] extends ZodTypeAny ? z.infer<S["Params"]> : unknown,
  S["ResBody"] extends ZodTypeAny ? z.infer<S["ResBody"]> : unknown,
  S["ReqBody"] extends ZodTypeAny ? z.infer<S["ReqBody"]> : unknown,
  S["ReqQuery"] extends ZodTypeAny ? z.infer<S["ReqQuery"]> : unknown
>;

export type TypesFromSchema<S extends APISchema> = {
  Params: S["Params"] extends ZodTypeAny ? z.infer<S["Params"]> : unknown;
  ResBody: S["ResBody"] extends ZodTypeAny ? z.infer<S["ResBody"]> : unknown;
  ReqBody: S["ReqBody"] extends ZodTypeAny ? z.infer<S["ReqBody"]> : unknown;
  ReqQuery: S["ReqQuery"] extends ZodTypeAny ? z.infer<S["ReqQuery"]> : unknown;
};

export type UnionToIntersection<U> = (U extends unknown ? (x: U) => void : never) extends (
  x: infer I,
) => void
  ? I
  : never;
