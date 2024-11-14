import { RequestHandler } from "express";
import { AuthError } from "./error";

export const validateLogged: RequestHandler = function (req, res, next) {
  if (req.session.user_id) {
    next();
  } else {
    throw new AuthError("Anda perlu login terlebih dahulu!");
  }
};
