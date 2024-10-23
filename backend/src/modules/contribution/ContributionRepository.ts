import { ExpressionBuilder, Kysely } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { DB } from "../../db/db_types";
import { ContributionStatus, parseContribStatus } from "./ContributionMisc.js";

const defaultContributionFields = (eb: ExpressionBuilder<DB, "ms_contributions">) =>
  [
    "ms_contributions.name",
    "ms_contributions.description",
    "ms_contributions.status",
    "ms_contributions.project_id",
    "ms_contributions.id as id",
    "ms_contributions.created_at as created_at",
    jsonArrayFrom(
      eb
        .selectFrom("ms_contributions_users")
        .select("ms_contributions_users.user_id")
        .whereRef("ms_contributions_users.contributions_id", "=", "ms_contributions.id"),
    ).as("user_ids"),
  ] as const;

export type Contribution = NonNullable<
  Awaited<ReturnType<ContributionRepository["getContributionsDetail"]>>
>;

export class ContributionRepository {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async getContributions(user_id?: number, project_id?: number) {
    let query = this.db.selectFrom("ms_contributions").select(defaultContributionFields);

    if (user_id !== undefined) {
      query = query.where((eb) =>
        eb(
          "ms_contributions.id",
          "in",
          eb
            .selectFrom("ms_contributions_users")
            .select("ms_contributions_users.contributions_id")
            .where("ms_contributions_users.user_id", "=", user_id),
        ),
      );
    }

    if (project_id !== undefined) {
      query = query.where("ms_contributions.project_id", "=", project_id);
    }
    const result = await query.execute();

    return result.map((x) => {
      return {
        ...x,
        status: parseContribStatus(x.status),
      };
    });
  }

  async getContributionsDetail(contribution_id: number) {
    const result = await this.db
      .selectFrom("ms_contributions")
      .select(defaultContributionFields)
      .where("ms_contributions.id", "=", contribution_id)
      .executeTakeFirst();

    if (result == undefined) {
      return undefined;
    }

    return {
      ...result,
      status: parseContribStatus(result.status),
    };
  }

  async addContributions(
    obj: {
      name: string;
      description: string;
      project_id: number;
      status: ContributionStatus;
    },
    users: number[],
  ) {
    const { status, name, description, project_id } = obj;
    const cont = await this.db
      .insertInto("ms_contributions")
      .values({
        name: name,
        description: description,
        project_id: project_id,
        status: status,
      })
      .returning(["ms_contributions.id"])
      .executeTakeFirst();

    if (!cont) {
      throw new Error("Data not inserted!");
    }
    for (const x of users) {
      await this.db
        .insertInto("ms_contributions_users")
        .values({
          user_id: x,
          contributions_id: cont.id,
        })
        .execute();
    }
    return cont;
  }

  async updateContribution(
    id: number,
    obj: {
      name?: string;
      description?: string;
      project_id?: number;
      user_ids?: number[];
      status?: ContributionStatus;
    },
  ) {
    const { name, description, project_id, user_ids, status } = obj;
    const cont = await this.db
      .updateTable("ms_contributions")
      .set({
        name,
        description,
        project_id,
        status,
      })
      .where("id", "=", id)
      .executeTakeFirst();

    if (!cont) {
      throw new Error("Data not updated!");
    }
    if (user_ids != undefined) {
      await this.db
        .deleteFrom("ms_contributions_users")
        .where("contributions_id", "=", id)
        .execute();
      for (const x of user_ids) {
        await this.db
          .insertInto("ms_contributions_users")
          .values({
            user_id: x,
            contributions_id: id,
          })
          .execute();
      }
    }
  }
}
