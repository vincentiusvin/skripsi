import { compareSync } from "bcryptjs";
import { db } from "../db/db";
import { ClientError } from "../helpers/error";
import { RH } from "../helpers/types";

// Get logged in user
export const getSession: RH<{
  ResBody: { user_name: string; logged: true; user_id: number } | { logged: false };
}> = async function (req, res) {
  const userId = req.session.user_id;
  const user =
    userId &&
    (await db
      .selectFrom("ms_users")
      .select(["name as user_name", "id as user_id"])
      .where("id", "=", userId)
      .executeTakeFirst());

  if (user) {
    res.status(200).json({
      user_name: user.user_name,
      user_id: user.user_id,
      logged: true,
    });
  } else {
    res.status(200).json({
      logged: false,
    });
  }
};

// Login
export const putSession: RH<{
  ResBody: { user_name: string };
  ReqBody: { user_name: string; user_password: string };
}> = async function (req, res) {
  const { user_password, user_name } = req.body;

  const user = await db
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
export const deleteSession: RH<{ ResBody: { msg: string } }> = function (req, res) {
  req.session.destroy(() => {
    res.status(200).json({
      msg: "Success",
    });
  });
};
