import { AuthError, ClientError, NotFoundError } from "../../helpers/error.js";
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

  async createReport(opts: {
    title: string;
    description: string;
    sender_id: number;
    chatroom_id?: number;
  }) {
    return await this.report_repo.addReport({ ...opts, status: "Pending" });
  }

  async updateReportStatus(report_id: number, status: ReportStatus, resolution?: string) {
    if (status === "Pending") {
      await this.report_repo.updateReport(report_id, {
        status,
        resolution: null,
        resolved_at: null,
      });
    } else {
      if (resolution == undefined || resolution == "") {
        throw new ClientError("Anda tidak boleh menyelesaikan laporan tanpa memberikan catatan!");
      }
      await this.report_repo.updateReport(report_id, {
        status,
        resolution,
        resolved_at: new Date(),
      });
    }
  }

  async updateReport(
    report_id: number,
    opts: {
      title?: string;
      description?: string;
      chatroom_id?: number;
      status?: ReportStatus;
      resolution?: string;
    },
    sender_id: number,
  ) {
    const data = await this.report_repo.getReportByID(report_id);
    if (!data) {
      throw new NotFoundError("Laporan gagal ditemukan!");
    }

    const is_admin = await this.user_service.isAdminUser(sender_id);
    if (!is_admin && data.sender_id !== sender_id) {
      throw new AuthError("Anda hanya boleh mengedit laporan buatan anda sendiri!");
    }

    const { status, resolution, ...rest } = opts;
    if (status != undefined || resolution != undefined) {
      if (!is_admin) {
        throw new AuthError("Anda tidak boleh menangani laporan apabila anda bukan admin!");
      }
      await this.updateReportStatus(
        report_id,
        status != undefined ? status : data.status,
        resolution,
      );
    }

    return await this.report_repo.updateReport(report_id, rest);
  }
}
