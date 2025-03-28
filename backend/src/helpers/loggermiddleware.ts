import { RequestHandler } from "express";
import logger from "./logging.js";

export const loggingMiddleware: RequestHandler = function (req, res, next) {
  res.on("finish", () => {
    logger.http(`${req.method} ${req.originalUrl} --- ${res.statusCode} ${res.statusMessage}`, {
      req_query: req.query,
      req_method: req.method,
      req_body: req.body,
      req_params: req.params,
      req_url: req.originalUrl,
      res_status: res.statusCode,
    });
  });
  next();
};
