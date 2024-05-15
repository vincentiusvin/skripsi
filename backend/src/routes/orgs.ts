import { RequestHandler } from "express";
import { db } from "../db/db";
import {
  EmptyLocals,
  EmptyParams,
  EmptyReqBody,
  EmptyReqQuery,
} from "../template";

export const getOrgs: RequestHandler<
  EmptyParams,
  { org_name: string; org_description: string }[],
  EmptyReqBody,
  EmptyReqQuery,
  EmptyLocals
> = async function (req, res) {
  const orgs = await db
    .selectFrom("orgs")
    .select(["name as org_name", "description as org_description"])
    .execute();

  res.json(orgs);
  return;
};

export const postOrgs: RequestHandler<
  EmptyParams,
  { msg: string },
  { org_name: string; org_description: string },
  EmptyReqQuery,
  EmptyLocals
> = async function (req, res) {
  const { org_name, org_description } = req.body;
  const userID = req.session.user_id!;

  const sameName = await db
    .selectFrom("orgs")
    .select(["name"])
    .where("name", "=", org_name)
    .execute();

  if (sameName.length !== 0) {
    res
      .status(400)
      .json({ msg: "Sudah ada organisasi dengan nama yang sama!" });
    return;
  }

  try {
    await db.transaction().execute(async () => {
      const org = await db
        .insertInto("orgs")
        .values({
          name: org_name,
          description: org_description,
        })
        .executeTakeFirst();

      if (org.insertId) {
        await db
          .insertInto("orgs_users")
          .values({
            users_id: userID,
            orgs_id: Number(org.insertId),
            permission: "Owner",
          })
          .execute();
      }
    });
    res.status(201).json({ msg: "Organisasi berhasil dibuat!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Request gagal!" });
  }

  return;
};
