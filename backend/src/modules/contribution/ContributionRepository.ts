import { Kysely } from "kysely";
import { DB } from "../../db/db_types";

export class ContributionRepository {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async getContributions(user_id?: number, project_id?: number) {
    const query = this.db
      .selectFrom("ms_contributions")
      .innerJoin(
        "ms_contributions_users",
        "ms_contributions.id",
        "ms_contributions_users.contributions_id",
      )
      .select([
        "ms_contributions.name as contributions_name",
        "ms_contributions.description as contributions_description",
        "ms_contributions.status as contributions_status",
      ]);
    if (user_id !== undefined) {
      query.where("ms_contributions_users.user_id", "=", user_id);
    }

    console.log("id:" + project_id);
    if (project_id !== undefined) {
      query.where("ms_contributions.project_id", "=", project_id);
    }
    return await query.execute();
  }

  async getContributionsDetail(contributions_id: number) {
    return await this.db
      .selectFrom("ms_contributions")
      .innerJoin(
        "ms_contributions_users",
        "ms_contributions.id",
        "ms_contributions_users.contributions_id",
      )
      .innerJoin("ms_users", "ms_contributions_users.user_id", "ms_users.id")
      .select([
        "ms_contributions.name as contributions_name",
        "ms_contributions.description as contributions_description",
        "ms_contributions.status as contributions_status",
        "ms_users.name as user_name",
      ])
      .where("ms_contributions.id", "=", contributions_id)
      .executeTakeFirst();
  }

  async addContributions(
    obj: {
      cont_name: string;
      cont_description: string;
      cont_project_id: number;
    },
    firstUser: number,
  ) {
    const { cont_name, cont_description, cont_project_id } = obj;
    return await this.db.transaction().execute(async (trx) => {
      const cont = await trx
        .insertInto("ms_contributions")
        .values({
          name: cont_name,
          description: cont_description,
          project_id: cont_project_id,
          status: "pending",
        })
        .returning(["ms_contributions.id"])
        .executeTakeFirst();

      if (!cont) {
        throw new Error("Data not inserted!");
      }

      await trx
        .insertInto("ms_contributions_users")
        .values({
          user_id: firstUser,
          contributions_id: cont.id,
        })
        .execute();

      await trx
        .insertInto("ms_contributions_projects")
        .values({
          project_id: cont_project_id,
          contributions_id: cont.id,
        })
        .execute();
      return cont;
    });
  }

  async statusContributions(id: number, status: string) {
    return await this.db.transaction().execute(async (trx) => {
      const cont = await trx
        .updateTable("ms_contributions")
        .set({
          status: status,
        })
        .where("id", "=", id)
        .executeTakeFirst();

      if (!cont) {
        throw new Error("Data not updated!");
      }
    });
  }
}
