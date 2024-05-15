import { compareSync } from "bcryptjs";
import { db } from "../db/db";
import { EmptyLocals, EmptyParams, EmptyReqBody, EmptyReqQuery, RH } from "../template";

// Get logged in user
export const getSession: RH<
  EmptyParams,
  { user_name: string; logged: boolean },
  EmptyReqBody,
  EmptyReqQuery,
  EmptyLocals
> = async function (req, res) {
  const userId = req.session.user_id;
  const user =
    userId &&
    (await db.selectFrom("users").select(["name"]).where("id", "=", userId).executeTakeFirst());

  if (user) {
    res.status(200).json({
      user_name: user.name,
      logged: true,
    });
  } else {
    res.status(200).json({
      user_name: "Guest",
      logged: false,
    });
  }
};

// Login
export const putSession: RH<
  EmptyParams,
  { user_name: string },
  { user_name: string; user_password: string },
  EmptyReqQuery,
  EmptyLocals
> = async function (req, res) {
  const { user_password, user_name } = req.body;

  const user = await db
    .selectFrom("users")
    .select(["name", "password", "id"])
    .where("users.name", "=", user_name)
    .executeTakeFirst();

  if (!user) {
    res.status(400).json({
      msg: "Wrong credentials!",
    });
    return;
  }

  const check = compareSync(user_password, user?.password);

  if (check) {
    req.session.user_id = user.id;
    res.status(200).json({
      user_name: user.name,
    });
  } else {
    res.status(400).json({
      msg: "Wrong credentials!",
    });
  }
};

// Logout
export const deleteSession: RH<
  EmptyParams,
  { msg: string },
  EmptyReqBody,
  EmptyReqQuery,
  EmptyLocals
> = function (req, res) {
  req.session.destroy(() => {
    res.status(200).json({
      msg: "Success",
    });
  });
};
