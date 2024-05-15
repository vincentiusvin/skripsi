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
  { org_id: number; org_name: string; org_description: string }[],
  EmptyReqBody,
  EmptyReqQuery,
  EmptyLocals
> = async function (req, res) {
  const orgs = await db
    .selectFrom("orgs")
    .select([
      "id as org_id",
      "name as org_name",
      "description as org_description",
    ])
    .execute();

  res.json(orgs);
  return;
};

export const getOrgDetail: RequestHandler<
  { id: number },
  | {
      org_id: number;
      org_name: string;
      org_description: string;
      org_address: string;
      org_phone: string;
    }
  | { msg: string },
  EmptyReqBody,
  EmptyReqQuery,
  EmptyLocals
> = async function (req, res) {
  const id = req.params.id;

  const org = await db
    .selectFrom("orgs")
    .select([
      "id as org_id",
      "name as org_name",
      "description as org_description",
      "address as org_address",
      "phone as org_phone",
    ])
    .where("id", "=", id)
    .executeTakeFirst();

  if (org) {
    res.json(org);
  } else {
    res
      .status(404)
      .json({ msg: "Organisasi yang dicari tidak dapat ditemukan!" });
  }

  return;
};

export const postOrgs: RequestHandler<
  EmptyParams,
  { msg: string },
  {
    org_name: string;
    org_description: string;
    org_address: string;
    org_phone: string;
  },
  EmptyReqQuery,
  EmptyLocals
> = async function (req, res) {
  const { org_name, org_description, org_address, org_phone } = req.body;
  const userID = req.session.user_id!;

  if (org_name.length === 0) {
    res.status(400).json({ msg: "Nama tidak boleh kosong!" });
    return;
  }

  if (org_description.length === 0) {
    res.status(400).json({ msg: "Deskripsi tidak boleh kosong!" });
    return;
  }

  if (org_address.length === 0) {
    res.status(400).json({ msg: "Alamat tidak boleh kosong!" });
    return;
  }

  if (org_phone.length === 0) {
    res.status(400).json({ msg: "Nomor telepon tidak boleh kosong!" });
    return;
  }

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
          address: org_address,
          phone: org_phone,
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
