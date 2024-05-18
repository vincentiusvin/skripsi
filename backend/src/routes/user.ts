import { hashSync } from "bcryptjs";
import { db } from "../db/db";
import { ClientError } from "../helpers/error";
import { RH } from "../helpers/types";

export const postUser: RH<{
  ResBody: { msg: string };
  ReqBody: { user_name: string; user_password: string };
}> = async function (req, res) {
  const { user_name, user_password } = req.body;

  if (user_name.length === 0) {
    throw new ClientError("Username tidak boleh kosong!");
  }

  if (user_password.length === 0) {
    throw new ClientError("Password tidak boleh kosong!");
  }

  const similar = await db
    .selectFrom("ms_users")
    .select("id")
    .where("ms_users.name", "=", user_name)
    .execute();

  if (similar.length !== 0) {
    throw new ClientError("Sudah ada username dengan nama yang sama!");
  }

  const encrypt = hashSync(user_password, 10);

  await db
    .insertInto("ms_users")
    .values({
      name: user_name,
      password: encrypt,
    })
    .execute();

  res.status(201).json({ msg: "User berhasil dibuat!" });
};
