import { hashSync } from "bcryptjs";
import type { Express } from "express";
import { Kysely } from "kysely";
import { z } from "zod";
import { DB } from "../../db/db_types.js";
import { Controller, Route } from "../../helpers/controller.js";
import { ClientError } from "../../helpers/error.js";
import { RH } from "../../helpers/types.js";

export class UserController extends Controller {
  private db: Kysely<DB>;
  constructor(express_server: Express, db: Kysely<DB>) {
    super(express_server);
    this.db = db;
  }

  init() {
    return {
      UsersPost: new Route({
        handler: this.postUser,
        method: "post",
        path: "/api/users",
        schema: {
          ReqBody: this.postUserReqBody,
        },
      }),

      UsersGet: new Route({
        handler: this.getUser,
        method: "get",
        path: "/api/users",
      }),
    };
  }

  private postUserReqBody = z.object({
    user_name: z.string().min(1, "Username tidak boleh kosong!"),
    user_password: z.string().min(1, "Password tidak boleh kosong!"),
  });

  private postUser: RH<{
    ResBody: { msg: string };
    ReqBody: { user_name: string; user_password: string };
  }> = async (req, res) => {
    const { user_name, user_password } = req.body;

    const similar = await this.db
      .selectFrom("ms_users")
      .select("id")
      .where("ms_users.name", "=", user_name)
      .execute();

    if (similar.length !== 0) {
      throw new ClientError("Sudah ada username dengan nama yang sama!");
    }

    const encrypt = hashSync(user_password, 10);

    await this.db
      .insertInto("ms_users")
      .values({
        name: user_name,
        password: encrypt,
      })
      .execute();

    res.status(201).json({ msg: "User berhasil dibuat!" });
  };

  private getUser: RH<{
    ResBody: { user_id: number; user_name: string }[];
  }> = async (req, res) => {
    const result = await this.db
      .selectFrom("ms_users")
      .select(["ms_users.id as user_id", "ms_users.name as user_name"])
      .execute();

    res.status(200).json(result);
  };
}
