import { ReportRepository } from "./ReportRepository.js";

export class ReportService {
  private report_repo: ReportRepository;
  constructor(report_repo: ReportRepository) {
    this.report_repo = report_repo;
  }

  async getReports() {
    return await this.report_repo.getReports();
  }

  async getReportByID(report_id: number) {
    return await this.report_repo.getReportByID(report_id);
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
    return await this.report_repo.addReport(opts);
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
    return await this.report_repo.updateReport(report_id, opts);
  }
}
