import { hashSync } from "bcrypt";
import { RequestHandler } from "express";
import { db } from "../db/db";
import { EmptyLocals, EmptyParams, EmptyReqQuery } from "../template";

export const postUser: RequestHandler<
  EmptyParams,
  { msg: string },
  { user_name: string; user_password: string },
  EmptyReqQuery,
  EmptyLocals
> = async function (req, res) {
  const { user_name, user_password } = req.body;

  if (user_name.length === 0) {
    res.status(400).json({ msg: "Username tidak boleh kosong!" });
    return;
  }

  if (user_password.length === 0) {
    res.status(400).json({ msg: "Password tidak boleh kosong!" });
    return;
  }

  const similar = await db
    .selectFrom("users")
    .select("id")
    .where("users.name", "=", user_name)
    .execute();

  if (similar.length !== 0) {
    res.status(400).json({ msg: "Sudah ada username dengan nama yang sama!" });
    return;
  }

  const encrypt = hashSync(user_password, 10);

  await db
    .insertInto("users")
    .values({
      name: user_name,
      password: encrypt,
    })
    .execute();

  res.status(201).json({ msg: "User berhasil dibuat!" });
};
