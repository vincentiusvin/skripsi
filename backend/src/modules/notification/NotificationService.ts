import { AuthError, NotFoundError } from "../../helpers/error.js";
import { TransactionManager } from "../../helpers/transaction/transaction.js";
import { EmailService, IEmailService } from "../email/EmailService.js";
import { PreferenceService, preferenceServiceFactory } from "../preferences/PreferenceService.js";
import { UserService, userServiceFactory } from "../user/UserService.js";
import { NotificationTypes, getPreferenceKeyFromNotificationType } from "./NotificationMisc.js";
import { NotificationRepository } from "./NotificationRepository.js";

export function notificationServiceFactory(transaction_manager: TransactionManager) {
  const db = transaction_manager.getDB();
  const notification_repo = new NotificationRepository(db);
  const user_service = userServiceFactory(transaction_manager);
  const email_service = EmailService.fromEnv();
  const preference_service = preferenceServiceFactory(transaction_manager);
  const notification_service = new NotificationService(
    notification_repo,
    email_service,
    user_service,
    preference_service,
  );
  return notification_service;
}

export class NotificationService {
  private notificiation_repo: NotificationRepository;
  private email_service: IEmailService;
  private user_service: UserService;
  private preference_service: PreferenceService;

  constructor(
    notification_repo: NotificationRepository,
    email_service: IEmailService,
    user_service: UserService,
    preference_service: PreferenceService,
  ) {
    this.notificiation_repo = notification_repo;
    this.email_service = email_service;
    this.user_service = user_service;
    this.preference_service = preference_service;
  }

  private async getNotificationPreference(user_id: number, notification_type: NotificationTypes) {
    const pref = await this.preference_service.getUserPreference(user_id);
    const key = getPreferenceKeyFromNotificationType(notification_type);
    return pref[key];
  }

  async addNotification(opts: {
    title: string;
    description: string;
    user_id: number;
    type: NotificationTypes; // informasi resource untuk notification ini
    type_id?: number; // opsional - id resource tersebut
  }) {
    const { title, description, user_id, type } = opts;

    const user = await this.user_service.getUserDetail(user_id);
    if (!user) {
      throw new NotFoundError("Gagal menemukan pengguna tersebut!");
    }

    const pref = await this.getNotificationPreference(user_id, type);
    if (pref === "off") {
      return;
    }

    const result = await this.notificiation_repo.addNotification(opts);

    if (pref === "email" && user.user_email) {
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

  async isAllowedToModify(notification_id: number, sender_id: number) {
    const notif = await this.notificiation_repo.getNotification(notification_id);
    if (!notif) {
      throw new NotFoundError("Notifikasi gagal ditemukan!");
    }
    if (sender_id == notif.user_id) {
      return true;
    }
    const is_admin = await this.user_service.isAdminUser(sender_id);
    return is_admin;
  }

  async updateNotification(notification_id: number, read: boolean, sender_id: number) {
    const is_allowed = await this.isAllowedToModify(notification_id, sender_id);
    if (!is_allowed) {
      throw new AuthError("Anda tidak memiliki akses untuk melakukan hal ini!");
    }

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
