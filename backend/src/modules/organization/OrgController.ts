import { RequestHandler } from "express";
import { Kysely } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { Application } from "../../app.js";
import { DB } from "../../db/db_types.js";
import { Controller, Route } from "../../helpers/controller.js";
import { ClientError, NotFoundError } from "../../helpers/error.js";
import { RH } from "../../helpers/types.js";
import { validateLogged } from "../../helpers/validate.js";

export class OrgController extends Controller {
  private db: Kysely<DB>;
  constructor(app: Application) {
    super(app);
    this.db = app.db;
  }

  init() {
    return {
      OrgsPost: new Route({
        handler: this.postOrgs,
        method: "post",
        path: "/api/orgs",
        priors: [validateLogged as RequestHandler],
      }),
      OrgsGet: new Route({
        handler: this.getOrgs,
        method: "get",
        path: "/api/orgs",
      }),
      OrgsDetailGet: new Route({
        handler: this.getOrgsDetail,
        method: "get",
        path: "/api/orgs/:id",
      }),
      OrgsCategoriesGet: new Route({
        handler: this.getOrgsCategories,
        method: "get",
        path: "/api/org-categories",
      }),
      OrgsUpdate: new Route({
        handler: this.updateOrgs,
        method: "put",
        path: "/api/orgs/:id",
      }),
      OrgsDelete: new Route({
        handler: this.deleteOrgs,
        method: "delete",
        path: "/api/orgs/:id",
      }),
    };
  }

  getOrgs: RH<{
    ResBody: {
      org_id: number;
      org_name: string;
      org_description: string;
      org_image: string | null;
    }[];
  }> = async (req, res) => {
    const orgs = await this.db
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

  getOrgsDetail: RH<{
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
  }> = async (req, res) => {
    const id = req.params.id;

    const org = await this.db
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

  postOrgs: RH<{
    ResBody: { msg: string };
    ReqBody: {
      org_name: string;
      org_description: string;
      org_address: string;
      org_phone: string;
      org_image?: string;
      org_category?: number[];
    };
  }> = async (req, res) => {
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

    const sameName = await this.db
      .selectFrom("ms_orgs")
      .select(["name"])
      .where("name", "=", org_name)
      .execute();

    if (sameName.length !== 0) {
      throw new ClientError("Sudah ada organisasi dengan nama yang sama!");
    }

    await this.db.transaction().execute(async (trx) => {
      const org = await trx
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

      for (const cat_id of org_category ?? []) {
        await trx
          .insertInto("categories_orgs")
          .values({
            org_id: org.id,
            category_id: cat_id,
          })
          .execute();
      }

      await trx
        .insertInto("orgs_users")
        .values({
          user_id: userID,
          org_id: org.id,
          role: "Owner",
        })
        .execute();
    });
    res.status(201).json({ msg: "Organisasi berhasil dibuat!" });
  };

  getOrgsCategories: RH<{
    ResBody: {
      category_id: number;
      category_name: string;
    }[];
  }> = async (req, res) => {
    const categories = await this.db
      .selectFrom("ms_category_orgs")
      .select(["id as category_id", "name as category_name"])
      .execute();

    res.status(200).json(categories);
  };

  updateOrgs: RH<{
    ResBody: {
      msg: string;
    };
    ReqParam: {
      id: number;
    };
    ReqBody: {
      org_name?: string;
      org_description?: string;
      org_address?: string;
      org_phone?: string;
      org_image?: string;
      org_category?: number[];
    };
  }> = async (req, res) => {
    const { org_name, org_description, org_address, org_phone, org_image, org_category } = req.body;
    const id = req.params.id;

    if (org_name) {
      const sameName = await this.db
        .selectFrom("ms_orgs")
        .select(["name"])
        .where("name", "=", org_name)
        .execute();

      if (sameName.length !== 0) {
        throw new ClientError("Sudah ada organisasi dengan nama yang sama!");
      }
    }

    await this.db.transaction().execute(async (trx) => {
      const org = await trx
        .updateTable("ms_orgs")
        .set({
          name: org_name,
          description: org_description,
          address: org_address,
          phone: org_phone,
          ...(org_image && { image: org_image }),
        })
        .where("id", "=", id)
        .executeTakeFirst();

      if (!org) {
        throw new Error("Data not inserted!");
      }

      await trx.deleteFrom("categories_orgs").where("org_id", "=", id).execute();

      for (const cat_id of org_category ?? []) {
        await trx
          .insertInto("categories_orgs")
          .values({
            org_id: id,
            category_id: cat_id,
          })
          .execute();
      }
    });
    res.status(200).json({ msg: "Organisasi berhasil di update!" });
  };

  deleteOrgs: RH<{
    ResBody: {
      msg: string;
    };
    ReqParam: {
      id: number;
    };
  }> = async (req, res) => {
    const id = req.params.id;

    const orgExists = await this.db
      .selectFrom("ms_orgs")
      .select(["id"])
      .where("id", "=", id)
      .executeTakeFirst();
    if (!orgExists) {
      throw new ClientError("ID Organisasi tidak ditemukan");
    }

    await this.db.transaction().execute(async (trx) => {
      await trx.deleteFrom("ms_task_buckets").execute();
      await trx.deleteFrom("ms_projects").where("org_id", "=", id).execute();
      await trx.deleteFrom("categories_orgs").where("org_id", "=", id).execute();
      await trx.deleteFrom("orgs_users").where("org_id", "=", id).execute();
      await trx.deleteFrom("ms_orgs").where("id", "=", id).execute();
    });
    res.status(200).json({ msg: "Organisasi berhasil di hapuskan" });
  };
}
