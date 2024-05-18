import express, { json } from "express";
import session from "express-session";
import { dbPool } from "./db/db";
import { errorHandler } from "./helpers/error";
import { logger } from "./helpers/logger";
import { registerRoutes } from "./routes";
import connectPgSimple = require("connect-pg-simple");
import _session = require("express-session");

const pgSession = connectPgSimple(_session);

const app = express();

app.use(logger);

declare module "express-session" {
  interface SessionData {
    user_id?: number;
  }
}

const store = new pgSession({
  pool: dbPool,
});

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  }),
);

app.use(json());

registerRoutes(app);

app.use(errorHandler);

app.listen(5000, () => {
  console.log("Server listening on port 5000");
});
