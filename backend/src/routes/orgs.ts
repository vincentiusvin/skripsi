import { jsonArrayFrom } from "kysely/helpers/postgres";
import { db } from "../db/db";
import { ClientError, NotFoundError } from "../helpers/error";
import { RH } from "../helpers/types";

export const getOrgs: RH<{
  ResBody: {
    org_id: number;
    org_name: string;
    org_description: string;
    org_image: string | null;
  }[];
}> = async function (req, res) {
  const orgs = await db
    .selectFrom("orgs")
    .select([
      "id as org_id",
      "name as org_name",
      "description as org_description",
      "image as org_image",
    ])
    .execute();

  res.json(orgs);
  return;
};

export const getOrgDetail: RH<{
  ReqParams: { id: number };
  ResBody: {
    org_id: number;
    org_name: string;
    org_description: string;
    org_address: string;
    org_phone: string;
    org_users: {
      id: number;
      name: string;
    }[];
    org_image: string | null;
  };
}> = async function (req, res) {
  const id = req.params.id;

  const org = await db
    .selectFrom("orgs")
    .select((eb) => [
      "id as org_id",
      "name as org_name",
      "description as org_description",
      "address as org_address",
      "phone as org_phone",
      "image as org_image",
      jsonArrayFrom(
        eb
          .selectFrom("orgs_users")
          .innerJoin("users", "orgs_users.user_id", "users.id")
          .select(["users.id as id", "users.name as name"])
          .whereRef("orgs_users.org_id", "=", "orgs.id"),
      ).as("org_users"),
    ])
    .where("id", "=", id)
    .executeTakeFirst();

  if (!org) {
    throw new NotFoundError("Organisasi yang dicari tidak dapat ditemukan!");
  }

  res.json(org);
};

export const postOrgs: RH<{
  ResBody: { msg: string };
  ReqBody: {
    org_name: string;
    org_description: string;
    org_address: string;
    org_phone: string;
    org_image?: string;
  };
}> = async function (req, res) {
  const { org_name, org_description, org_address, org_phone, org_image } = req.body;
  const userID = req.session.user_id!;

  if (org_name.length === 0) {
    throw new ClientError("Nama tidak boleh kosong!");
  }

  if (org_description.length === 0) {
    throw new ClientError("Deskripsi tidak boleh kosong!");
  }

  if (org_address.length === 0) {
    throw new ClientError("Alamat tidak boleh kosong!");
  }

  if (org_phone.length === 0) {
    throw new ClientError("Nomor telepon tidak boleh kosong!");
  }

  const sameName = await db
    .selectFrom("orgs")
    .select(["name"])
    .where("name", "=", org_name)
    .execute();

  if (sameName.length !== 0) {
    throw new ClientError("Sudah ada organisasi dengan nama yang sama!");
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
          ...(org_image && { image: org_image }),
        })
        .returning("id")
        .executeTakeFirst();

      if (!org) {
        throw new Error("Data not inserted!");
      }
      await db
        .insertInto("orgs_users")
        .values({
          user_id: userID,
          org_id: org.id,
          permission: "Owner",
        })
        .execute();
    });
    res.status(201).json({ msg: "Organisasi berhasil dibuat!" });
  } catch (error) {
    throw new Error("Request gagal!");
  }

  return;
};
