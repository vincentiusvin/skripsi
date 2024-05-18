import { ErrorRequestHandler } from "express";

export class ClientError extends Error {}
export class AuthError extends Error {}
export class NotFoundError extends Error {}

export const errorHandler: ErrorRequestHandler = function (error, req, res, next) {
  console.error(error);
  if (error instanceof ClientError) {
    res.status(400).json({ msg: error.message });
  } else if (error instanceof AuthError) {
    res.status(401).json({ msg: error.message });
  } else if (error instanceof NotFoundError) {
    res.status(404).json({ msg: error.message });
  } else {
    next(error);
  }
};
