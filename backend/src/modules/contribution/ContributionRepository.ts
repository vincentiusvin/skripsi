import { Kysely } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { DB } from "../../db/db_types";

export class ContributionRepository {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async getContributions(user_id?: number, project_id?: number) {
    let query = this.db
      .selectFrom("ms_contributions")
      .select((eb) => [
        "ms_contributions.name as contributions_name",
        "ms_contributions.description as contributions_description",
        "ms_contributions.status as contributions_status",
        "ms_contributions.project_id as project_id",
        "ms_contributions.id as id",
        jsonArrayFrom(
          eb
            .selectFrom("ms_contributions_users")
            .select("ms_contributions_users.user_id")
            .whereRef("ms_contributions_users.contributions_id", "=", "ms_contributions.id"),
        ).as("contribution_users"),
      ]);
    if (user_id !== undefined) {
      query = query.where((eb) =>
        eb(
          "ms_contributions.id",
          "in",
          eb
            .selectFrom("ms_contributions_users")
            .select("ms_contributions_users.user_id")
            .where("ms_contributions_users.user_id", "=", user_id),
        ),
      );
    }

    if (project_id !== undefined) {
      query = query.where("ms_contributions.project_id", "=", project_id);
    }
    return await query.execute();
  }

  async getContributionsDetail(contributions_id: number) {
    return await this.db
      .selectFrom("ms_contributions")
      .select((eb) => [
        "ms_contributions.name as contributions_name",
        "ms_contributions.description as contributions_description",
        "ms_contributions.status as contributions_status",
        "ms_contributions.project_id as project_id",
        "ms_contributions.id as id",
        jsonArrayFrom(
          eb
            .selectFrom("ms_contributions_users")
            .select("ms_contributions_users.user_id")
            .whereRef("ms_contributions_users.contributions_id", "=", "ms_contributions.id"),
        ).as("contribution_users"),
      ])
      .where("ms_contributions.id", "=", contributions_id)
      .executeTakeFirst();
  }

  async addContributions(
    obj: {
      contributions_name: string;
      contributions_description: string;
      contributions_project_id: number;
    },
    users: number[],
  ) {
    const { contributions_name, contributions_description, contributions_project_id } = obj;
    return await this.db.transaction().execute(async (trx) => {
      const cont = await trx
        .insertInto("ms_contributions")
        .values({
          name: contributions_name,
          description: contributions_description,
          project_id: contributions_project_id,
          status: "Pending",
        })
        .returning(["ms_contributions.id"])
        .executeTakeFirst();

      if (!cont) {
        throw new Error("Data not inserted!");
      }
      for (const x of users) {
        await trx
          .insertInto("ms_contributions_users")
          .values({
            user_id: x,
            contributions_id: cont.id,
          })
          .execute();
      }
      return cont;
    });
  }

  async statusContributions(
    id: number,
    obj: {
      contributions_name?: string;
      contributions_description?: string;
      contributions_project_id?: number;
      user_id?: number[];
      status?: string;
    },
  ) {
    const {
      contributions_name,
      contributions_description,
      contributions_project_id,
      user_id,
      status,
    } = obj;
    return await this.db.transaction().execute(async (trx) => {
      const cont = await trx
        .updateTable("ms_contributions")
        .set({
          name: contributions_name,
          description: contributions_description,
          project_id: contributions_project_id,
          status: status,
        })
        .where("id", "=", id)
        .executeTakeFirst();

      if (!cont) {
        throw new Error("Data not updated!");
      }
      if (user_id != undefined) {
        await trx.deleteFrom("ms_contributions_users").where("contributions_id", "=", id).execute();
        for (const x of user_id) {
          await trx
            .insertInto("ms_contributions_users")
            .values({
              user_id: x,
              contributions_id: id,
            })
            .execute();
        }
      }
    });
  }
}
