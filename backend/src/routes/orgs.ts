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
    .selectFrom("ms_orgs")
    .select([
      "id as org_id",
      "name as org_name",
      "description as org_description",
      "image as org_image",
    ])
    .execute();

  res.status(200).json(orgs);
};

export const getOrgsDetail: RH<{
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
    org_categories: string[];
  };
}> = async function (req, res) {
  const id = req.params.id;

  const org = await db
    .selectFrom("ms_orgs")
    .select((eb) => [
      "ms_orgs.id as org_id",
      "ms_orgs.name as org_name",
      "ms_orgs.description as org_description",
      "ms_orgs.address as org_address",
      "ms_orgs.phone as org_phone",
      "ms_orgs.image as org_image",
      jsonArrayFrom(
        eb
          .selectFrom("orgs_users")
          .innerJoin("ms_users", "orgs_users.user_id", "ms_users.id")
          .select(["ms_users.id as id", "ms_users.name as name"])
          .whereRef("orgs_users.org_id", "=", "ms_orgs.id"),
      ).as("org_users"),
      jsonArrayFrom(
        eb
          .selectFrom("categories_orgs")
          .innerJoin("ms_category_orgs", "categories_orgs.category_id", "ms_category_orgs.id")
          .select(["ms_category_orgs.name as category_name"])
          .whereRef("categories_orgs.org_id", "=", "ms_orgs.id"),
      ).as("org_categories"),
    ])
    .where("ms_orgs.id", "=", id)
    .executeTakeFirst();

  if (!org) {
    throw new NotFoundError("Organisasi yang dicari tidak dapat ditemukan!");
  }

  // Extract category names from the org object
  const orgCategories = org.org_categories.map(
    (category: { category_name: string }) => category.category_name,
  );

  // Return modified org object with org_categories
  const modifiedOrg = {
    ...org,
    org_categories: orgCategories,
  };

  res.status(200).json(modifiedOrg);
};

export const postOrgs: RH<{
  ResBody: { msg: string };
  ReqBody: {
    org_name: string;
    org_description: string;
    org_address: string;
    org_phone: string;
    org_image?: string;
    org_category: number;
  };
}> = async function (req, res) {
  const { org_name, org_description, org_address, org_phone, org_image, org_category } = req.body;
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

  if (!org_category) throw new ClientError("Kategori tidak boleh kosong!");

  const sameName = await db
    .selectFrom("ms_orgs")
    .select(["name"])
    .where("name", "=", org_name)
    .execute();

  if (sameName.length !== 0) {
    throw new ClientError("Sudah ada organisasi dengan nama yang sama!");
  }

  try {
    await db.transaction().execute(async () => {
      const org = await db
        .insertInto("ms_orgs")
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
        .insertInto("categories_orgs")
        .values({
          org_id: org.id,
          category_id: org_category,
        })
        .execute();

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
};

export const getOrgsCategories: RH<{
  ResBody: {
    category_id: number;
    category_name: string;
  }[];
}> = async function (req, res) {
  const categories = await db
    .selectFrom("ms_category_orgs")
    .select(["id as category_id", "name as category_name"])
    .execute();

  res.status(200).json(categories);
};

export const updateOrgs: RH<{
  ResBody: {
    msg: string;
  };
  ReqBody: {
    org_id: number;
    org_name: string;
    org_description: string;
    org_address: string;
    org_phone: string;
    org_image?: string;
    org_category: number;
  };
}> = async function (req, res) {
  const { org_name, org_description, org_address, org_phone, org_image, org_category, org_id } =
    req.body;
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

  if (!org_category) {
    throw new ClientError("Kategori tidak boleh kosong!");
  }
  const sameName = await db
    .selectFrom("ms_orgs")
    .select(["name"])
    .where("name", "=", org_name)
    .execute();

  if (sameName.length !== 0) {
    throw new ClientError("Sudah ada organisasi dengan nama yang sama!");
  }

  try {
    await db.transaction().execute(async () => {
      const org = await db
        .updateTable("ms_orgs")
        .set({
          name: org_name,
          description: org_description,
          address: org_address,
          phone: org_phone,
          ...(org_image && { image: org_image }),
        })
        .where("id", "=", org_id)
        .executeTakeFirst();

      if (!org) {
        throw new Error("Data not inserted!");
      }

      await db
        .updateTable("categories_orgs")
        .set({
          category_id: org_category,
        })
        .execute();

      await db
        .updateTable("orgs_users")
        .set({
          user_id: userID,
          permission: "Owner",
        })
        .execute();
    });
    res.status(201).json({ msg: "Organisasi berhasil di update!" });
  } catch (error) {
    throw new Error("Request gagal!");
  }
};

export const deleteOrgs: RH<{
  ResBody: {
    msg: string;
  };
  ReqBody: {
    org_id: number;
  };
}> = async function (req, res) {
  const { org_id } = req.body;

  const orgExists = await db
    .selectFrom("ms_orgs")
    .select(["id"])
    .where("id", "=", org_id)
    .executeTakeFirst();
  if (!orgExists) {
    throw new ClientError("ID Organisasi tidak ditemukan");
  }

  try {
    await db.transaction().execute(async () => {
      await db.deleteFrom("ms_projects").where("org_id", "=", org_id).execute();
      await db.deleteFrom("categories_orgs").where("org_id", "=", org_id).execute();
      await db.deleteFrom("orgs_users").where("org_id", "=", org_id).execute();
      await db.deleteFrom("ms_orgs").where("id", "=", org_id).execute();
    });
    res.status(200).json({ msg: "Organisasi berhasil di hapuskan" });
  } catch (error) {
    throw new Error("Gagal Delete");
  }
};
