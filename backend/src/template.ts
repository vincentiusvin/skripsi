import { RequestHandler } from "express";

export type EmptyParams = never; // Param itu data kiriman yang ada di URL, http://website/api/items?page=1
export type EmptyResBody = never; // ResBody itu jawaban dari server
export type EmptyReqBody = never; // ReqBody itu data kiriman yang gaada di url
export type EmptyReqQuery = never; // ReqQuery itu data yang ada langsung di pathnya, http://website/api/user/1
export type EmptyLocals = never;

// Untuk template bisa ikutin ini:
// const fn: RequestHandler<
//   EmptyParams,
//   EmptyResBody,
//   EmptyReqBody,
//   EmptyReqQuery,
//   EmptyLocals
// > = function (req, res) {
//   return;
// };

// Lalu register fungsinya ke index.ts dan exports.d.ts

// Testing typing

type subclass = RequestHandler<
  unknown,
  never,
  unknown,
  unknown,
  Record<string, never>
>;
type parent = RequestHandler<never, unknown, never, never, never>;

type check = subclass extends parent ? true : false;
