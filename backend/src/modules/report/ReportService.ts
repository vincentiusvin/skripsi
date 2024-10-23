import { AuthError, ClientError, NotFoundError } from "../../helpers/error.js";
import { TransactionManager } from "../../helpers/service.js";
import { ChatService, chatServiceFactory } from "../chatroom/ChatroomService.js";
import {
  NotificationService,
  notificationServiceFactory,
} from "../notification/NotificationService.js";
import { UserService, userServiceFactory } from "../user/UserService.js";
import { ReportStatus } from "./ReportMisc.js";
import { ReportRepository } from "./ReportRepository.js";

export function reportServiceFactory(transaction_manager: TransactionManager) {
  const db = transaction_manager.db;
  const report_repo = new ReportRepository(db);
  const user_service = userServiceFactory(transaction_manager);
  const notification_service = notificationServiceFactory(transaction_manager);
  const chat_service = chatServiceFactory(transaction_manager);

  const report_service = new ReportService(
    report_repo,
    user_service,
    chat_service,
    notification_service,
  );
  return report_service;
}

export class ReportService {
  private report_repo: ReportRepository;
  private user_service: UserService;
  private chat_service: ChatService;
  private notification_service: NotificationService;

  constructor(
    report_repo: ReportRepository,
    user_service: UserService,
    chat_service: ChatService,
    notification_service: NotificationService,
  ) {
    this.report_repo = report_repo;
    this.user_service = user_service;
    this.chat_service = chat_service;
    this.notification_service = notification_service;
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

  async createReport(opts: { title: string; description: string; sender_id: number }) {
    return await this.report_repo.addReport({ ...opts, status: "Pending" });
  }

  private async sendReportResolutionNotification(
    report_id: number,
    status: "Resolved" | "Rejected",
  ) {
    const report = await this.report_repo.getReportByID(report_id);
    if (!report || report.status !== status) {
      throw new Error(`Laporan ${report_id} gagal ditemukan.`);
    }

    const translate_status = {
      Resolved: "diterima",
      Rejected: "ditolak",
    }[status];

    await this.notification_service.addNotification({
      title: `Laporan "${report.title}" telah ${translate_status}`,
      user_id: report.sender_id,
      description: `Laporan anda telah ${translate_status} oleh pengelola website.
      Anda dapat membaca alasan lebih lanjut pada halaman laporan.`,
      type: "ReportUpdate",
      type_id: report.id,
    });
  }

  private async sendReportChatroomCreatedNotification(report_id: number) {
    const report = await this.report_repo.getReportByID(report_id);
    if (!report) {
      throw new Error(`Laporan ${report_id} gagal ditemukan.`);
    }

    await this.notification_service.addNotification({
      title: `Diskusi "${report.title}"`,
      user_id: report.sender_id,
      description: `Pengelola website telah membuka ruang diskusi untuk membahas laporan ${report.title} yang anda buat.`,
      type: "ReportUpdate",
      type_id: report.id,
    });
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
      await this.sendReportResolutionNotification(report_id, status);
    }
  }

  async createReportChatroom(
    report_id: number,
    report_name: string,
    admin_id: number,
    filer_id: number,
  ) {
    const chatroom_id = await this.chat_service.addUserChatroom(
      admin_id,
      `Diskusi Laporan - ${report_name}`,
      admin_id,
    );
    await this.chat_service.updateChatroom(
      chatroom_id,
      {
        user_ids: admin_id !== filer_id ? [admin_id, filer_id] : [admin_id],
      },
      admin_id,
    );
    await this.report_repo.updateReport(report_id, {
      chatroom_id,
    });
    await this.sendReportChatroomCreatedNotification(report_id);
  }

  async updateReport(
    report_id: number,
    opts: {
      title?: string;
      description?: string;
      status?: ReportStatus;
      resolution?: string;
      chatroom?: boolean;
    },
    sender_id: number,
  ) {
    const old_data = await this.report_repo.getReportByID(report_id);
    if (!old_data) {
      throw new NotFoundError("Laporan gagal ditemukan!");
    }

    const is_admin = await this.user_service.isAdminUser(sender_id);
    if (!is_admin && old_data.sender_id !== sender_id) {
      throw new AuthError("Anda hanya boleh mengedit laporan buatan anda sendiri!");
    }

    const { status, resolution, chatroom, ...rest } = opts;
    await this.report_repo.updateReport(report_id, rest);

    const refreshed_data = await this.report_repo.getReportByID(report_id);
    if (!refreshed_data) {
      throw new Error("Laporan gagal ditemukan setelah diupdate!");
    }

    if (status != undefined || resolution != undefined) {
      if (!is_admin) {
        throw new AuthError("Anda tidak boleh menangani laporan apabila anda bukan admin!");
      }
      await this.updateReportStatus(
        report_id,
        status != undefined ? status : refreshed_data.status,
        resolution,
      );
    }

    if (chatroom == true) {
      if (!is_admin) {
        throw new AuthError("Anda tidak boleh menambah ruang percakapan apabila anda bukan admin!");
      }
      if (refreshed_data.chatroom_id != null) {
        throw new ClientError("Laporan ini sudah memiliki ruang percakapan!");
      }
      await this.createReportChatroom(
        report_id,
        refreshed_data.title,
        sender_id,
        refreshed_data.sender_id,
      );
    }
  }
}
