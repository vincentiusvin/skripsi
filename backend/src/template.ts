import { RequestHandler } from "express";

export type EmptyParams = never; // Param itu data kiriman yang ada di URL, http://website/api/items?page=1
export type EmptyResBody = never; // ResBody itu jawaban dari server
export type EmptyReqBody = never; // ReqBody itu data kiriman yang gaada di url
export type EmptyReqQuery = never; // ReqQuery itu data yang ada langsung di pathnya, http://website/api/user/1
export type EmptyLocals = never;

export type RH<
  Params = EmptyParams,
  ResBody = EmptyResBody,
  ReqBody = EmptyReqBody,
  ReqQuery = EmptyReqQuery,
  Locals extends Record<string, unknown> = EmptyLocals
> = RequestHandler<
  Params,
  ResBody | { msg: string },
  ReqBody,
  ReqQuery,
  Locals
>;

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
