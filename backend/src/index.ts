import express, { Request, json } from "express";
import session from "express-session";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { dbPool } from "./db/db";
import { AuthError, errorHandler } from "./helpers/error";
import { logger } from "./helpers/logger";
import { registerRoutes } from "./routes";
import connectPgSimple = require("connect-pg-simple");
import _session = require("express-session");

const pgSession = connectPgSimple(_session);

export const app = express();
const server = createServer(app);
export const io = new Server(server, {
  path: "/api/chat",
});

app.use(logger);

declare module "express-session" {
  interface SessionData {
    user_id?: number;
  }
}

const store = new pgSession({
  pool: dbPool,
});

const sessionMiddleware = session({
  secret: "secret",
  resave: false,
  saveUninitialized: false,
  store: store,
});

app.use(sessionMiddleware);

app.use(json());

io.engine.use(sessionMiddleware);

io.use((sock, next) => {
  const req = sock.request as Request;
  const userId = req.session.user_id;
  sock.data.userId = userId;
  if (!userId) {
    next(new AuthError("Anda harus login!"));
  } else {
    next();
  }
});

registerRoutes(app);

app.use(errorHandler);

// server.listen(5000, () => {
//   console.log("Server listening on port 5000");
// });
