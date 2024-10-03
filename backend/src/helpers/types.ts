import { RequestHandler } from "express";
import { ZodTypeAny, z } from "zod";

export type APISchema<
  ZParams extends ZodTypeAny = ZodTypeAny,
  ZResBody extends ZodTypeAny = ZodTypeAny,
  ZReqBody extends ZodTypeAny = ZodTypeAny,
  ZReqQuery extends ZodTypeAny = ZodTypeAny,
> = {
  Params?: ZParams;
  ResBody?: ZResBody;
  ReqBody?: ZReqBody;
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

type RequestHandlerOptions = {
  // Param itu data kiriman yang ada di pathnya, http://website/api/user/1.
  Params?: Record<string, string>;
  // ResBody itu jawaban dari server. Declare untuk request yang sukses aja.
  // Request gagal formatnya bakal pakai {msg: string} tapi ga usah dimasukkin ke sini.
  // Kalau request sukses formatnya {msg: string} silahkan ditaruh disini.
  ResBody?: Record<string, unknown> | Record<string, unknown>[];
  // ReqBody itu data kiriman yang dtaruh di body, bukan di url.
  ReqBody?: Record<string, unknown>;
  // ReqQuery itu data yang ada habis path, http://website/api/items?page=1
  ReqQuery?: Record<string, unknown>;
  // Variabel yang di-set secara lokal di variabel res. Untuk pass info ke handler selanjutnya.
  Locals?: Record<string, unknown>;
};

type FillOptionals<T extends RequestHandlerOptions> = {
  [K in keyof Required<RequestHandlerOptions>]: undefined extends T[K]
    ? Record<string, never>
    : NonNullable<T[K]>;
};

type RequestHandlerInjector<Options extends Required<RequestHandlerOptions>> = RequestHandler<
  Options["Params"],
  Options["ResBody"],
  Options["ReqBody"],
  Options["ReqQuery"],
  Options["Locals"]
>;

/**
 * Wrapper untuk RequestHandler.
 * Ngubah RequestHandler<A, B, ...> jadi RequestHandler<{A: foo, B: bar, ...}>
 * Properti yang nggak ditulis otomatis dijadiin Record<string, never>
 */
export type RH<Options extends RequestHandlerOptions = Required<RequestHandlerOptions>> =
  RequestHandlerInjector<FillOptionals<Options>>;

/**
 * Top typenya RH.
 * Locals, Params, ReqBody, dan ReqQuery diassign never karena
 * mereka argument fungsi. Contravariant terhadap fungsi RH.
 *
 * ResBody itu return type fungsi. Covariant terhadap fungsi Rh.
 */
export type RHTop = RH<{
  Locals: never;
  Params: never;
  ReqBody: never;
  ReqQuery: never;
  ResBody: Record<string, unknown> | Record<string, unknown>[];
}>;

export type ExtractRH<T> = T extends RH<infer O> ? FillOptionals<O> : never;

export type UnionToIntersection<U> = (U extends unknown ? (x: U) => void : never) extends (
  x: infer I,
) => void
  ? I
  : never;
