import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import logger from "./logging.js";

export class ClientError extends Error {}
export class AuthError extends Error {}
export class NotFoundError extends Error {}

export const errorHandler: ErrorRequestHandler = function (error, req, res, next) {
  if (error instanceof ClientError) {
    res.status(400).json({ msg: error.message });
  } else if (error instanceof ZodError) {
    res.status(401).json({ msg: error.issues[0].message });
  } else if (error instanceof AuthError) {
    res.status(401).json({ msg: error.message });
  } else if (error instanceof NotFoundError) {
    res.status(404).json({ msg: error.message });
  } else {
    logger.error(error.message, {
      req_query: req.query,
      req_body: req.body,
      req_method: req.method,
      req_params: req.params,
      req_url: req.originalUrl,
      res_status: res.statusCode,
    });
    next(error);
  }
};
