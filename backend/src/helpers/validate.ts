import { RequestHandler } from "express";
import {
  EmptyLocals,
  EmptyParams,
  EmptyReqBody,
  EmptyReqQuery,
} from "../template";

export const validateLogged: RequestHandler<
  EmptyParams,
  { msg: string },
  EmptyReqBody,
  EmptyReqQuery,
  EmptyLocals
> = function (req, res, next) {
  if (req.session.user_id) {
    next();
  } else {
    res.status(401).json({ msg: "You need to be logged in!" });
  }
};
