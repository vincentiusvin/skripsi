import { compareSync } from "bcryptjs";
import type { Express } from "express";
import { Kysely } from "kysely";
import { DB } from "../../db/db_types.js";
import { Controller, Route } from "../../helpers/controller.js";
import { ClientError } from "../../helpers/error.js";
import { RH } from "../../helpers/types.js";

export class SessionController extends Controller {
  private db: Kysely<DB>;
  constructor(express_server: Express, db: Kysely<DB>) {
    super(express_server);
    this.db = db;
  }

  init() {
    return {
      SessionGet: new Route({
        handler: this.getSession,
        method: "get",
        path: "/api/session",
      }),
      SessionPut: new Route({
        handler: this.putSession,
        method: "put",
        path: "/api/session",
      }),
      SessionDelete: new Route({
        handler: this.deleteSession,
        method: "delete",
        path: "/api/session",
      }),
    };
  }

  // Get logged in user
  private getSession: RH<{
    ResBody:
      | { user_name: string; logged: true; user_id: number; is_admin: boolean }
      | { logged: false };
  }> = async (req, res) => {
    const userId = req.session.user_id;
    const user =
      userId &&
      (await this.db
        .selectFrom("ms_users")
        .select(["name as user_name", "id as user_id", "is_admin"])
        .where("id", "=", userId)
        .executeTakeFirst());

    if (user) {
      res.status(200).json({
        user_name: user.user_name,
        user_id: user.user_id,
        logged: true,
        is_admin: user.is_admin,
      });
    } else {
      res.status(200).json({
        logged: false,
      });
    }
  };

  // Login
  private putSession: RH<{
    ResBody: { user_name: string };
    ReqBody: { user_name: string; user_password: string };
  }> = async (req, res) => {
    const { user_password, user_name } = req.body;

    const user = await this.db
      .selectFrom("ms_users")
      .select(["name", "password", "id"])
      .where("ms_users.name", "=", user_name)
      .executeTakeFirst();

    if (!user) {
      throw new ClientError("Wrong credentials!");
    }

    const check = compareSync(user_password, user?.password);

    if (check) {
      req.session.user_id = user.id;
      res.status(200).json({
        user_name: user.name,
      });
    } else {
      throw new ClientError("Wrong credentials!");
    }
  };

  // Logout
  private deleteSession: RH<{ ResBody: { msg: string } }> = async (req, res) => {
    req.session.destroy(() => {
      res.status(200).json({
        msg: "Success",
      });
    });
  };
}
