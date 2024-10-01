import { Kysely } from "kysely";
import { DB } from "../../db/db_types.js";

const defaultReportFields = [
  "ms_reports.id",
  "ms_reports.sender_id",
  "ms_reports.title",
  "ms_reports.description",
  "ms_reports.status",
  "ms_reports.created_at",
  "ms_reports.resolved_at",
] as const;

export class ReportRepository {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async getReports(opts: { user_id?: number }) {
    const { user_id } = opts;
    let query = this.db.selectFrom("ms_reports").select(defaultReportFields);

    if (user_id != undefined) {
      query = query.where("ms_reports.sender_id", "=", user_id);
    }

    return query.execute();
  }

  async getReportByID(report_id: number) {
    return await this.db
      .selectFrom("ms_reports")
      .select(defaultReportFields)
      .where("id", "=", report_id)
      .executeTakeFirst();
  }

  async addReport(opts: {
    title: string;
    description: string;
    status: string;
    sender_id: number;
    resolution?: string;
    resolved_at?: Date;
    chatroom_id?: number;
  }) {
    return await this.db.insertInto("ms_reports").values(opts).returning("id").executeTakeFirst();
  }

  async updateReport(
    report_id: number,
    opts: {
      title?: string;
      description?: string;
      status?: string;
      resolution?: string;
      resolved_at?: Date;
      sender_id?: number;
      chatroom_id?: number;
    },
  ) {
    await this.db.updateTable("ms_reports").set(opts).where("id", "=", report_id).execute();
  }

  async deleteReport(report_id: number) {
    await this.db.deleteFrom("ms_reports").where("id", "=", report_id).execute();
  }
}
