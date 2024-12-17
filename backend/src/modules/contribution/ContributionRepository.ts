import { ExpressionBuilder, Kysely, SelectQueryBuilder } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { DB } from "../../db/db_types";
import { paginateQuery } from "../../helpers/pagination.js";
import { ContributionStatus, parseContribStatus } from "./ContributionMisc.js";

const defaultContributionFields = (eb: ExpressionBuilder<DB, "contributions">) =>
  [
    "contributions.name",
    "contributions.description",
    "contributions.status",
    "contributions.project_id",
    "contributions.id as id",
    "contributions.created_at as created_at",
    jsonArrayFrom(
      eb
        .selectFrom("contributions_users")
        .select("contributions_users.user_id")
        .whereRef("contributions_users.contributions_id", "=", "contributions.id"),
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

  private applyFilterToQuery<O>(
    query: SelectQueryBuilder<DB, "contributions", O>,
    filter: {
      status?: ContributionStatus;
      user_id?: number;
      project_id?: number;
      keyword?: string;
    },
  ) {
    const { user_id, keyword, project_id, status } = filter;

    if (user_id != undefined) {
      query = query.where((eb) =>
        eb(
          "contributions.id",
          "in",
          eb
            .selectFrom("contributions_users")
            .select("contributions_users.contributions_id")
            .where("contributions_users.user_id", "=", user_id),
        ),
      );
    }

    if (project_id != undefined) {
      query = query.where("contributions.project_id", "=", project_id);
    }

    if (status != undefined) {
      query = query.where("contributions.status", "=", status);
    }

    if (keyword != undefined) {
      query = query.where("contributions.name", "ilike", keyword);
    }

    return query;
  }

  async getContributions(opts: {
    status?: ContributionStatus;
    page?: number;
    limit?: number;
    user_id?: number;
    project_id?: number;
  }) {
    const { limit, page, ...filters } = opts;
    let query = this.db
      .selectFrom("contributions")
      .select(defaultContributionFields)
      .orderBy("id desc");

    query = this.applyFilterToQuery(query, filters);

    query = paginateQuery(query, {
      page,
      limit,
    });

    const result = await query.execute();

    return result.map((x) => {
      return {
        ...x,
        status: parseContribStatus(x.status),
      };
    });
  }

  async countContributions(opts: {
    status?: ContributionStatus;
    user_id?: number;
    project_id?: number;
  }) {
    let query = this.db.selectFrom("contributions").select((eb) => eb.fn.countAll().as("count"));
    query = this.applyFilterToQuery(query, opts);
    return await query.executeTakeFirstOrThrow();
  }

  async getContributionsDetail(contribution_id: number) {
    const result = await this.db
      .selectFrom("contributions")
      .select(defaultContributionFields)
      .where("contributions.id", "=", contribution_id)
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
      .insertInto("contributions")
      .values({
        name: name,
        description: description,
        project_id: project_id,
        status: status,
      })
      .returning(["contributions.id"])
      .executeTakeFirst();

    if (!cont) {
      throw new Error("Data not inserted!");
    }
    for (const x of users) {
      await this.db
        .insertInto("contributions_users")
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
      .updateTable("contributions")
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
      await this.db.deleteFrom("contributions_users").where("contributions_id", "=", id).execute();
      for (const x of user_ids) {
        await this.db
          .insertInto("contributions_users")
          .values({
            user_id: x,
            contributions_id: id,
          })
          .execute();
      }
    }
  }
}
