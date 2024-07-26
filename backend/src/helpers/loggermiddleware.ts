import logger from "./logging.js";
import { RH } from "./types";

export const loggingMiddleware: RH = function (req, res, next) {
  res.on("finish", () => {
    logger.http(`${req.method} ${req.originalUrl} --- ${res.statusCode} ${res.statusMessage}`, {
      req_query: req.query,
      req_body: req.body,
      req_params: req.params,
      req_url: req.originalUrl,
      res_status: res.statusCode,
    });
  });
  next();
};
