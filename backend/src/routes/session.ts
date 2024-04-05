import { RequestHandler } from "express";
import {
  EmptyLocals,
  EmptyParams,
  EmptyReqBody,
  EmptyReqQuery,
  EmptyResBody,
} from "../template";

// Get logged in user
export const getSession: RequestHandler<
  EmptyParams,
  { user_name: string },
  EmptyReqBody,
  EmptyReqQuery,
  EmptyLocals
> = function (req, res) {
  const user = req.session.user_id;
  if (user) {
    res.status(200).json({
      user_name: "Logged User",
    });
  } else {
    res.status(200).json({
      user_name: "Guest",
    });
  }
};

// Login
export const putSession: RequestHandler<
  EmptyParams,
  { user_name: string } | { msg: string },
  { user_name: string; user_password: string },
  EmptyReqQuery,
  EmptyLocals
> = function (req, res) {
  const { user_password } = req.body;
  if (user_password === "password") {
    req.session.user_id = "/user/1";
    res.status(200).json({
      user_name: "Logged User",
    });
  } else {
    res.status(401).json({
      msg: "Wrong credentials!",
    });
  }
};

// Logout
export const deleteSession: RequestHandler<
  EmptyParams,
  EmptyResBody,
  EmptyReqBody,
  EmptyReqQuery,
  EmptyLocals
> = function (req, res) {
  req.session.destroy(() => {
    res.status(204);
  });
};
