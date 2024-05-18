import { RH } from "./types";

export const logger: RH = function (req, res, next) {
  res.on("finish", () => {
    console.log(`${req.method} ${req.originalUrl} --- ${res.statusCode} ${res.statusMessage}`);
  });
  next();
};
