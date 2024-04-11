import express, { json } from "express";
import session from "express-session";
import { deleteSession, getSession, putSession } from "./routes/session";
import { postUser } from "./routes/user";
import { logger } from "./utils/logger";

const app = express();

app.use(logger);

declare module "express-session" {
  interface SessionData {
    user_id?: number;
  }
}

app.use(
  session({
    secret: "secret",
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
