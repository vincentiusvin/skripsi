import { RequestHandler } from "express";

type RequestHandlerOptions = {
  // Param itu data kiriman yang ada di URL, http://website/api/user/1>.
  Params?: Record<string, unknown>;
  // ResBody itu jawaban dari server. Declare untuk request yang sukses aja.
  // Request gagal formatnya bakal pakai {msg: string} tapi ga usah dimasukkin ke sini.
  // Kalau request sukses formatnya {msg: string} silahkan ditaruh disini.
  ResBody?: Record<string, unknown> | Record<string, unknown>[];
  // ReqBody itu data kiriman yang dtaruh di body, bukan di url.
  ReqBody?: Record<string, unknown>;
  // ReqQuery itu data yang ada langsung di pathnya, http://website/api/items?page=1
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

export type ExtractRH<T> = T extends RH<infer O> ? FillOptionals<O> : never;

// Lalu register fungsinya ke index.ts, di _api dan juga app
