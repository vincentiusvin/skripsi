import express, { json } from "express";
import MySQLStore from "express-mysql-session";
import session, * as _Session from "express-session";
import { dbPool } from "./db";
import { deleteSession, getSession, putSession } from "./routes/session";
import { postUser } from "./routes/user";
import { logger } from "./utils/logger";
const MySQLSessionStore = MySQLStore(_Session);

const app = express();

app.use(logger);

declare module "express-session" {
  interface SessionData {
    user_id?: number;
  }
}

const store = new MySQLSessionStore({}, dbPool);

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(json());

app.get("/api/session", getSession);
app.put("/api/session", putSession);
app.delete("/api/session", deleteSession);

app.post("/api/user", postUser);

app.listen(5000, () => {
  console.log("Server listening on port 5000");
});
