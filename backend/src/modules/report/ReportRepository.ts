import { Kysely } from "kysely";
import { DB } from "../../db/db_types.js";
import { ReportStatus, parseReportStatus } from "./ReportMisc.js";

const defaultReportFields = [
  "ms_reports.id",
  "ms_reports.sender_id",
  "ms_reports.title",
  "ms_reports.description",
  "ms_reports.status",
  "ms_reports.created_at",
  "ms_reports.resolved_at",
  "ms_reports.resolution",
  "ms_reports.chatroom_id",
] as const;

export class ReportRepository {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async getReports(opts: { user_id?: number }) {
    const { user_id } = opts;
    let query = this.db.selectFrom("ms_reports").select(defaultReportFields).orderBy("id asc");

    if (user_id != undefined) {
      query = query.where("ms_reports.sender_id", "=", user_id);
    }

    const result = await query.execute();

    return result.map((x) => ({
      ...x,
      status: parseReportStatus(x.status),
    }));
  }

  async getReportByID(report_id: number) {
    const ret = await this.db
      .selectFrom("ms_reports")
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
    return await this.db.insertInto("ms_reports").values(opts).returning("id").executeTakeFirst();
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
      await this.db.updateTable("ms_reports").set(opts).where("id", "=", report_id).execute();
    }
  }

  async deleteReport(report_id: number) {
    await this.db.deleteFrom("ms_reports").where("id", "=", report_id).execute();
  }
}
