import { RequestHandler } from "express";
import { EmptyLocals, EmptyParams, EmptyReqBody } from "../template";

export const getTest: RequestHandler<
  EmptyParams,
  { msg: string },
  EmptyReqBody,
  { name: string },
  EmptyLocals
> = function (req, res) {
  res.status(200).json({ msg: `Hi, ${req.query.name}!` });
};
