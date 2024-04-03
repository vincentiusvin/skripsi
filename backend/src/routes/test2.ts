import { RequestHandler } from "express";
import { EmptyParams, EmptyReqQuery } from "../template";

export const postTest: RequestHandler<
  EmptyParams,
  { msg: string },
  { name: string },
  EmptyReqQuery,
  { auth: { user: number } }
> = function (req, res) {
  res.locals.auth.user = 50;
  res.status(200).json({ msg: `Hi, ${req.body.name}!` });
};
