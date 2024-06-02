import { hashSync } from "bcryptjs";
import { Kysely } from "kysely";
import { z } from "zod";
import { Application } from "../app.js";
import { DB } from "../db/db_types.js";
import { ClientError } from "../helpers/error";
import { RH } from "../helpers/types";
import { Controller, RegisterOptions } from "./controller.js";

export class UserController extends Controller {
  db: Kysely<DB>;
  constructor(app: Application) {
    super(app);
    this.db = app.db;
  }

  initialize(): RegisterOptions[] {
    return [
      {
        handler: this.postUser,
        method: "post",
        path: "/users",
      },
    ];
  }

  postUserReqBody = z.object({
    user_name: z.string(),
    user_password: z.string(),
  });

  postUser: RH<{
    ResBody: { msg: string };
    ReqBody: z.infer<UserController["postUserReqBody"]>;
  }> = async (req, res) => {
    const { user_name, user_password } = req.body;

    if (user_name.length === 0) {
      throw new ClientError("Username tidak boleh kosong!");
    }

    if (user_password.length === 0) {
      throw new ClientError("Password tidak boleh kosong!");
    }

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

  getUser: RH<{
    ResBody: { user_id: number; user_name: string }[];
  }> = async (req, res) => {
    const result = await this.db
      .selectFrom("ms_users")
      .select(["ms_users.id as user_id", "ms_users.name as user_name"])
      .execute();

    res.status(200).json(result);
  };
}
