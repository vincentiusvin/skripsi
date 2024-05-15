import { RequestHandler } from "express";
import {
  EmptyLocals,
  EmptyParams,
  EmptyReqBody,
  EmptyReqQuery,
  EmptyResBody,
} from "../template";

export const logger: RequestHandler<
  EmptyParams,
  EmptyResBody,
  EmptyReqBody,
  EmptyReqQuery,
  EmptyLocals
> = function (req, res, next) {
  res.on("finish", () => {
    console.log(
      `${req.method} ${req.originalUrl} --- ${res.statusCode} ${res.statusMessage}`
    );
  });
  next();
};
