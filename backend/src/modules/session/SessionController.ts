import { compareSync } from "bcryptjs";
import type { Express } from "express";
import { Kysely } from "kysely";
import { z } from "zod";
import { DB } from "../../db/db_types.js";
import { Controller, Route } from "../../helpers/controller.js";
import { ClientError } from "../../helpers/error.js";

export class SessionController extends Controller {
  private db: Kysely<DB>;
  constructor(express_server: Express, db: Kysely<DB>) {
    super(express_server);
    this.db = db;
  }

  init() {
    return {
      SessionGet: this.SessionGet,
      SessionPut: this.SessionPut,
      SessionDelete: this.SessionDelete,
    };
  }

  SessionGet = new Route({
    method: "get",
    path: "/api/session",
    schema: {
      ResBody: z.union([
        z.object({
          user_name: z.string(),
          user_id: z.number(),
          logged: z.literal(true),
          is_admin: z.boolean(),
        }),
        z.object({
          logged: z.literal(false),
        }),
      ]),
    },
    handler: async (req, res) => {
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
    },
  });
  SessionPut = new Route({
    method: "put",
    path: "/api/session",
    schema: {
      ReqBody: z.object({
        user_password: z.string().min(1),
        user_name: z.string().min(1),
      }),
      ResBody: z.object({
        user_name: z.string(),
      }),
    },
    handler: async (req, res) => {
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
    },
  });

  SessionDelete = new Route({
    method: "delete",
    path: "/api/session",
    schema: {
      ResBody: z.object({
        msg: z.string(),
      }),
    },
    handler: async (req, res) => {
      req.session.destroy(() => {
        res.status(200).json({
          msg: "Success",
        });
      });
    },
  });
}
