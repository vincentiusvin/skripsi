import { AuthError } from "../../helpers/error.js";
import { UserService } from "../user/UserService.js";
import { ReportStatus } from "./ReportMisc.js";
import { ReportRepository } from "./ReportRepository.js";

export class ReportService {
  private report_repo: ReportRepository;
  private user_service: UserService;

  constructor(report_repo: ReportRepository, user_service: UserService) {
    this.report_repo = report_repo;
    this.user_service = user_service;
  }

  async getReports(
    opts: {
      user_id?: number;
    },
    sender_id: number,
  ) {
    const is_admin = await this.user_service.isAdminUser(sender_id);
    if (!is_admin && opts.user_id !== sender_id) {
      throw new AuthError("Anda hanya boleh membaca laporan buatan anda sendiri!");
    }
    return await this.report_repo.getReports(opts);
  }

  async getReportByID(report_id: number, sender_id: number) {
    const data = await this.report_repo.getReportByID(report_id);

    const is_admin = await this.user_service.isAdminUser(sender_id);
    if (!is_admin && data?.sender_id !== sender_id) {
      throw new AuthError("Anda hanya boleh membaca laporan buatan anda sendiri!");
    }

    return data;
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
    return await this.report_repo.addReport(opts);
  }

  async updateReport(
    report_id: number,
    opts: {
      title?: string;
      description?: string;
      status?: ReportStatus;
      resolution?: string;
      resolved_at?: Date;
      sender_id?: number;
      chatroom_id?: number;
    },
  ) {
    return await this.report_repo.updateReport(report_id, opts);
  }
}
