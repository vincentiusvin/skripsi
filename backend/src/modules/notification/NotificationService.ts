import { NotFoundError } from "../../helpers/error.js";
import { IEmailService } from "../email/EmailService.js";
import { UserService } from "../user/UserService.js";
import { NotificationRepository } from "./NotificationRepository.js";

export class NotificationService {
  private notificiation_repo: NotificationRepository;
  private email_service: IEmailService;
  private user_service: UserService;

  constructor(
    notification_repo: NotificationRepository,
    email_service: IEmailService,
    user_service: UserService,
  ) {
    this.notificiation_repo = notification_repo;
    this.email_service = email_service;
    this.user_service = user_service;
  }

  async addNotification(
    opts: {
      title: string;
      description: string;
      type: string;
      user_id: number;
    },
    send_mail?: boolean,
  ) {
    const { title, description, user_id } = opts;

    const user = await this.user_service.getUserAccountDetail(user_id);
    if (!user) {
      throw new NotFoundError("Gagal menemukan pengguna tersebut!");
    }

    const result = await this.notificiation_repo.addNotification(opts);

    if (send_mail && user.user_email) {
      await this.email_service.send_email({
        sender: "noreply",
        target: user.user_email,
        subject: title,
        html_content: description,
        text_content: description,
      });
    }

    return result;
  }

  async updateNotification(notification_id: number, read: boolean) {
    return await this.notificiation_repo.updateNotification(notification_id, {
      read,
    });
  }

  async getNotifications(opts: { user_id?: number; read?: boolean }) {
    return await this.notificiation_repo.getNotifications(opts);
  }

  async getNotification(notification_id: number) {
    return await this.notificiation_repo.getNotification(notification_id);
  }
}
