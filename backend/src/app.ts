import express, { Request, json } from "express";
import session from "express-session";
import { Kysely } from "kysely";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { db, dbPool } from "./db/db";
import { DB } from "./db/db_types.js";
import { AuthError, errorHandler } from "./helpers/error";
import { logger } from "./helpers/logger";
import { registerRoutes } from "./routes";
import connectPgSimple = require("connect-pg-simple");
import _session = require("express-session");

declare module "express-session" {
  interface SessionData {
    user_id?: number;
  }
}

export class Application {
  express_server: express.Express;
  http_server: import("http").Server;
  socket_server: import("socket.io").Server;
  db: Kysely<DB>;

  private static app: Application;
  static getApplication() {
    if (!this.app) {
      this.app = new Application();
    }
    return this.app;
  }

  private constructor() {
    const pgSession = connectPgSimple(_session);

    this.express_server = express();
    this.http_server = createServer(this.express_server);
    this.socket_server = new Server(this.http_server, {
      path: "/api/chat",
    });
    this.db = db;

    this.express_server.use(logger);

    const store = new pgSession({
      pool: dbPool,
    });

    const sessionMiddleware = session({
      secret: "secret",
      resave: false,
      saveUninitialized: false,
      store: store,
    });

    this.express_server.use(sessionMiddleware);

    this.express_server.use(json());

    this.socket_server.engine.use(sessionMiddleware);

    this.socket_server.use((sock, next) => {
      const req = sock.request as Request;
      const userId = req.session.user_id;
      sock.data.userId = userId;
      if (!userId) {
        next(new AuthError("Anda harus login!"));
      } else {
        next();
      }
    });

    registerRoutes(this.express_server);

    this.express_server.use(errorHandler);
  }

  listen(port: number) {
    this.http_server.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  }

  async close() {
    this.http_server.closeAllConnections();
    this.http_server.close();
    console.log("Server closed!");
  }
}
