import { ExpressionBuilder, Kysely } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { DB } from "../../db/db_types.js";
import { OrgRoles, parseRole } from "./OrgMisc.js";

function orgWithCategories(eb: ExpressionBuilder<DB, "ms_orgs">) {
  return jsonArrayFrom(
    eb
      .selectFrom("categories_orgs")
      .innerJoin("ms_category_orgs", "categories_orgs.category_id", "ms_category_orgs.id")
      .select(["ms_category_orgs.name as category_name", "ms_category_orgs.id as category_id"])
      .whereRef("categories_orgs.org_id", "=", "ms_orgs.id"),
  );
}

function orgWithUsers(eb: ExpressionBuilder<DB, "ms_orgs">) {
  return jsonArrayFrom(
    eb
      .selectFrom("orgs_users")
      .select(["orgs_users.user_id"])
      .whereRef("orgs_users.org_id", "=", "ms_orgs.id"),
  );
}

export class OrgRepository {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async getOrgs() {
    return await this.db
      .selectFrom("ms_orgs")
      .select((eb) => [
        "ms_orgs.id as org_id",
        "ms_orgs.name as org_name",
        "ms_orgs.description as org_description",
        "ms_orgs.address as org_address",
        "ms_orgs.phone as org_phone",
        "ms_orgs.image as org_image",
        orgWithCategories(eb).as("org_categories"),
        orgWithUsers(eb).as("org_users"),
      ])
      .execute();
  }

  async getOrgsByID(id: number) {
    return await this.db
      .selectFrom("ms_orgs")
      .select((eb) => [
        "ms_orgs.id as org_id",
        "ms_orgs.name as org_name",
        "ms_orgs.description as org_description",
        "ms_orgs.address as org_address",
        "ms_orgs.phone as org_phone",
        "ms_orgs.image as org_image",
        orgWithCategories(eb).as("org_categories"),
        orgWithUsers(eb).as("org_users"),
      ])
      .where("ms_orgs.id", "=", id)
      .executeTakeFirst();
  }

  async getOrgsByName(name: string) {
    return await this.db
      .selectFrom("ms_orgs")
      .select((eb) => [
        "ms_orgs.id as org_id",
        "ms_orgs.name as org_name",
        "ms_orgs.description as org_description",
        "ms_orgs.address as org_address",
        "ms_orgs.phone as org_phone",
        "ms_orgs.image as org_image",
        orgWithCategories(eb).as("org_categories"),
        orgWithUsers(eb).as("org_users"),
      ])
      .where("ms_orgs.name", "=", name)
      .executeTakeFirst();
  }

  async addOrg(
    obj: {
      org_name: string;
      org_description: string;
      org_address: string;
      org_phone: string;
      org_image?: string;
      org_categories?: number[];
    },
    firstUser: number,
  ) {
    const { org_name, org_address, org_description, org_phone, org_categories, org_image } = obj;
    return await this.db.transaction().execute(async (trx) => {
      const org = await trx
        .insertInto("ms_orgs")
        .values({
          name: org_name,
          description: org_description,
          address: org_address,
          phone: org_phone,
          ...(org_image && { image: org_image }),
        })
        .returning(["ms_orgs.id"])
        .executeTakeFirst();

      if (!org) {
        throw new Error("Data not inserted!");
      }

      for (const cat_id of org_categories ?? []) {
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
          user_id: firstUser,
          org_id: org.id,
          role: "Owner",
        })
        .execute();
      return org;
    });
  }

  async getCategories() {
    return await this.db
      .selectFrom("ms_category_orgs")
      .select(["id as category_id", "name as category_name"])
      .execute();
  }

  async updateOrg(
    id: number,
    obj: {
      org_name?: string;
      org_description?: string;
      org_address?: string;
      org_phone?: string;
      org_image?: string;
      org_category?: number[];
    },
  ) {
    const { org_name, org_description, org_address, org_phone, org_image, org_category } = obj;

    await this.db.transaction().execute(async (trx) => {
      if (
        org_name != undefined ||
        org_description != undefined ||
        org_address != undefined ||
        org_phone != undefined ||
        org_image != undefined
      ) {
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
          throw new Error("Data tidak update!");
        }
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
  }
  async deleteOrg(id: number) {
    await this.db.transaction().execute(async (trx) => {
      await trx.deleteFrom("ms_task_buckets").where("id", "=", id).execute();
      await trx.deleteFrom("ms_projects").where("org_id", "=", id).execute();
      await trx.deleteFrom("categories_orgs").where("org_id", "=", id).execute();
      await trx.deleteFrom("orgs_users").where("org_id", "=", id).execute();
      await trx.deleteFrom("ms_orgs").where("id", "=", id).execute();
    });
  }
  async getMemberRole(org_id: number, user_id: number): Promise<OrgRoles> {
    const res = await this.db
      .selectFrom("orgs_users")
      .select("role")
      .where((eb) =>
        eb.and({
          "orgs_users.user_id": user_id,
          "orgs_users.org_id": org_id,
        }),
      )
      .executeTakeFirst();

    if (!res) {
      return "Not Involved";
    }

    const ret = parseRole(res.role);
    return ret;
  }

  async assignMember(org_id: number, user_id: number, role: OrgRoles) {
    await this.db
      .insertInto("orgs_users")
      .values({
        org_id: org_id,
        user_id: user_id,
        role: role,
      })
      .onConflict((oc) =>
        oc.columns(["user_id", "org_id"]).doUpdateSet({
          role: role,
        }),
      )
      .execute();
  }

  async unassignMember(org_id: number, user_id: number) {
    await this.db
      .deleteFrom("orgs_users")
      .where((eb) =>
        eb.and({
          "orgs_users.org_id": org_id,
          "orgs_users.user_id": user_id,
        }),
      )
      .execute();
  }
}
