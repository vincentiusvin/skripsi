import { RequestHandler } from "express";

type RequestHandlerOptions = {
  Params?: Record<string, unknown>; // Param itu data kiriman yang ada di URL, http://website/api/items?page=1
  ResBody?: Record<string, unknown> | Record<string, unknown>[]; // ResBody itu jawaban dari server
  ReqBody?: Record<string, unknown>; // ReqBody itu data kiriman yang gaada di url
  ReqQuery?: Record<string, unknown>; // ReqQuery itu data yang ada langsung di pathnya, http://website/api/user/1
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

export type RH<Options extends RequestHandlerOptions = Required<RequestHandlerOptions>> =
  RequestHandlerInjector<FillOptionals<Options>>;

/**
 * RequestHandler itu fungsi.
 *
 * Params, ReqBody, ReqQuery, dan Locals itu properti di parameter fungsi.
 * Mereka contravariant terhadap generic kita.
 *
 * ResBody beda sendiri, dia itu parameter di method pada parameter fungsi
 * Dia covariant terhadap generic kita
 */
export type ExtractRH<T> = T extends RH<infer O> ? FillOptionals<O> : never;

// Untuk template bisa ikutin ini:
// export const fn: RH<
//   EmptyParams,
//   EmptyResBody,
//   EmptyReqBody,
//   EmptyReqQuery,
//   EmptyLocals
// > = function (req, res) {
//   return;
// };

// Lalu register fungsinya ke index.ts, di _api dan juga app
