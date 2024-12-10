import { ExpressionBuilder, Kysely, RawBuilder, SelectQueryBuilder } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { DB } from "../../db/db_types.js";
import { paginateQuery } from "../../helpers/pagination.js";
import { OrgRoles, parseRole } from "./OrgMisc.js";

const defaultOrgFields = [
  "ms_orgs.id as org_id",
  "ms_orgs.name as org_name",
  "ms_orgs.description as org_description",
  "ms_orgs.address as org_address",
  "ms_orgs.phone as org_phone",
  "ms_orgs.image as org_image",
] as const;

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
      .select(["orgs_users.user_id", "orgs_users.role as user_role"])
      .whereRef("orgs_users.org_id", "=", "ms_orgs.id"),
  ) as RawBuilder<
    {
      user_id: number;
      user_role: OrgRoles;
    }[]
  >;
}

export class OrgRepository {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  private applyFilterToQuery<O>(
    query: SelectQueryBuilder<DB, "ms_orgs", O>,
    filter?: { keyword?: string; user_id?: number },
  ) {
    const { user_id, keyword } = filter || {};
    if (user_id) {
      query = query.where((eb) =>
        eb(
          "ms_orgs.id",
          "in",
          eb
            .selectFrom("orgs_users")
            .select("orgs_users.org_id")
            .where("orgs_users.user_id", "=", user_id),
        ),
      );
    }

    if (keyword != undefined && keyword.length !== 0) {
      query = query.where((eb) =>
        eb.or([
          eb("ms_orgs.name", "ilike", `%${keyword}%`),
          eb("ms_orgs.address", "ilike", `%${keyword}%`),
          eb(
            "ms_orgs.id",
            "in",
            eb
              .selectFrom("ms_category_orgs")
              .innerJoin("categories_orgs", "ms_category_orgs.id", "categories_orgs.category_id")
              .select("categories_orgs.org_id")
              .where("ms_category_orgs.name", "ilike", `%${keyword}%`),
          ),
        ]),
      );
    }

    return query;
  }

  async countOrgs(filter?: { keyword?: string; user_id?: number }) {
    const { keyword, user_id } = filter || {};
    let query = this.db.selectFrom("ms_orgs").select((eb) => eb.fn.countAll().as("count"));
    query = this.applyFilterToQuery(query, { keyword, user_id });
    return await query.executeTakeFirstOrThrow();
  }

  getOrgs(filter?: { keyword?: string; user_id?: number; page?: number; limit?: number }) {
    const { keyword, user_id, page, limit } = filter ?? {};

    let query = this.db
      .selectFrom("ms_orgs")
      .select((eb) => [
        ...defaultOrgFields,
        orgWithCategories(eb).as("org_categories"),
        orgWithUsers(eb).as("org_users"),
      ]);

    query = this.applyFilterToQuery(query, { keyword, user_id });

    query = paginateQuery(query, {
      page,
      limit,
    });

    return query.execute();
  }

  async getOrgsByID(id: number) {
    return await this.db
      .selectFrom("ms_orgs")
      .select((eb) => [
        ...defaultOrgFields,
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
        ...defaultOrgFields,
        orgWithCategories(eb).as("org_categories"),
        orgWithUsers(eb).as("org_users"),
      ])
      .where("ms_orgs.name", "=", name)
      .executeTakeFirst();
  }

  async addOrg(obj: {
    org_name: string;
    org_description: string;
    org_address: string;
    org_phone: string;
    org_image?: string;
    org_categories?: number[];
  }) {
    const { org_name, org_address, org_description, org_phone, org_categories, org_image } = obj;
    const org = await this.db
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

    if (org_categories && org_categories.length) {
      await this.db
        .insertInto("categories_orgs")
        .values(
          org_categories.map((cat_id) => ({
            org_id: org.id,
            category_id: cat_id,
          })),
        )
        .execute();
    }

    return org;
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
      org_image?: string | null;
      org_category?: number[];
    },
  ) {
    const { org_category, ...rest } = obj;

    const need_main_update = Object.values(rest).some((x) => x !== undefined);

    if (need_main_update) {
      const { org_name, org_description, org_address, org_phone, org_image } = rest;
      const org = await this.db
        .updateTable("ms_orgs")
        .set({
          name: org_name,
          description: org_description,
          address: org_address,
          phone: org_phone,
          image: org_image,
        })
        .where("id", "=", id)
        .executeTakeFirst();

      if (!org) {
        throw new Error("Data tidak update!");
      }
    }

    if (org_category) {
      await this.db.deleteFrom("categories_orgs").where("org_id", "=", id).execute();

      if (org_category.length) {
        await this.db
          .insertInto("categories_orgs")
          .values(
            org_category.map((cat_id) => ({
              org_id: id,
              category_id: cat_id,
            })),
          )
          .execute();
      }
    }
  }
  async deleteOrg(id: number) {
    await this.db.deleteFrom("ms_orgs").where("id", "=", id).execute();
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
