import { Kysely, SelectQueryBuilder } from "kysely";
import { DB } from "../../db/db_types.js";
import { paginateQuery } from "../../helpers/pagination.js";
import { ReportStatus, parseReportStatus } from "./ReportMisc.js";

const defaultReportFields = [
  "reports.id",
  "reports.sender_id",
  "reports.title",
  "reports.description",
  "reports.status",
  "reports.created_at",
  "reports.resolved_at",
  "reports.resolution",
  "reports.chatroom_id",
] as const;

export class ReportRepository {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  applyFilterToQuery<O>(
    query: SelectQueryBuilder<DB, "reports", O>,
    filter: { user_id?: number; status?: ReportStatus },
  ) {
    const { user_id, status } = filter;
    if (user_id != undefined) {
      query = query.where("reports.sender_id", "=", user_id);
    }
    if (status != undefined) {
      query = query.where("reports.status", "=", status);
    }
    return query;
  }

  async countReports(opts: { user_id?: number; status?: ReportStatus }) {
    const { user_id, status } = opts;
    let query = this.db.selectFrom("reports").select((eb) => eb.fn.countAll().as("count"));
    query = this.applyFilterToQuery(query, { user_id, status });
    return await query.executeTakeFirstOrThrow();
  }

  async getReports(opts: {
    page?: number;
    limit?: number;
    user_id?: number;
    status?: ReportStatus;
  }) {
    const { user_id, status, page, limit } = opts;
    let query = this.db.selectFrom("reports").select(defaultReportFields).orderBy("id asc");
    query = this.applyFilterToQuery(query, { user_id, status });
    query = paginateQuery(query, {
      limit,
      page,
    });
    const result = await query.execute();

    return result.map((x) => ({
      ...x,
      status: parseReportStatus(x.status),
    }));
  }

  async getReportByID(report_id: number) {
    const ret = await this.db
      .selectFrom("reports")
      .select(defaultReportFields)
      .where("id", "=", report_id)
      .executeTakeFirst();

    if (ret == undefined) {
      return undefined;
    }

    return {
      ...ret,
      status: parseReportStatus(ret.status),
    };
  }

  async addReport(opts: {
    title: string;
    description: string;
    status: ReportStatus;
    sender_id: number;
    resolution?: string;
    resolved_at?: Date;
    chatroom_id?: number;
  }) {
    return await this.db.insertInto("reports").values(opts).returning("id").executeTakeFirst();
  }

  async updateReport(
    report_id: number,
    opts: {
      title?: string;
      description?: string;
      status?: ReportStatus;
      resolution?: string | null;
      resolved_at?: Date | null;
      sender_id?: number;
      chatroom_id?: number;
    },
  ) {
    if (Object.values(opts).some((x) => x != undefined)) {
      await this.db.updateTable("reports").set(opts).where("id", "=", report_id).execute();
    }
  }

  async deleteReport(report_id: number) {
    await this.db.deleteFrom("reports").where("id", "=", report_id).execute();
  }
}
