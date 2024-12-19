import { ErrorRequestHandler } from "express";
import { PayloadTooLarge } from "http-errors";
import { ZodError } from "zod";
import logger from "./logging.js";
import { FILE_LIMIT } from "./payloadmiddleware.js";

export class ClientError extends Error {}
export class AuthError extends Error {}
export class NotFoundError extends Error {}

export const errorHandler: ErrorRequestHandler = function (error, req, res, next) {
  logger.error(error.message, {
    error,
    error_stack: error.stack,
    req_query: req.query,
    req_body: req.body,
    req_method: req.method,
    req_params: req.params,
    req_url: req.originalUrl,
    res_status: res.statusCode,
  });

  if (error instanceof ClientError) {
    res.status(400).json({ msg: error.message });
  } else if (error instanceof PayloadTooLarge) {
    res
      .status(413)
      .json({
        msg: `File anda terlalu besar! Ukuran maksimum adalah ${FILE_LIMIT.toLocaleUpperCase()}.`,
      });
  } else if (error instanceof ZodError) {
    res.status(401).json({ msg: error.issues[0].message });
  } else if (error instanceof AuthError) {
    res.status(401).json({ msg: error.message });
  } else if (error instanceof NotFoundError) {
    res.status(404).json({ msg: error.message });
  } else {
    next(error);
  }
};
