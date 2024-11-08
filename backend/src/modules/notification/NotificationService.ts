import dayjs from "dayjs";
import { AuthError, NotFoundError } from "../../helpers/error.js";
import logger from "../../helpers/logging.js";
import { Transactable, TransactionManager } from "../../helpers/transaction/transaction.js";
import { EmailService, IEmailService } from "../email/EmailService.js";
import { PreferenceService, preferenceServiceFactory } from "../preferences/PreferenceService.js";
import { UserService, userServiceFactory } from "../user/UserService.js";
import { NotificationTypes, getPreferenceKeyFromNotificationType } from "./NotificationMisc.js";
import { NotificationRepository } from "./NotificationRepository.js";

export function envNotificationServiceFactory(transaction_manager: TransactionManager) {
  const email_service = EmailService.fromEnv();
  return notificationServiceFactory(transaction_manager, email_service);
}

function notificationServiceFactory(
  transaction_manager: TransactionManager,
  email_service: IEmailService,
) {
  const db = transaction_manager.getDB();
  const notification_repo = new NotificationRepository(db);
  const user_service = userServiceFactory(transaction_manager);
  const preference_service = preferenceServiceFactory(transaction_manager);
  const notification_service = new NotificationService(
    notification_repo,
    email_service,
    user_service,
    preference_service,
    transaction_manager,
  );
  return notification_service;
}

// Buffer notification types that are included here
const NOTIFICATION_TYPE_TO_BUFFER: NotificationTypes[] = ["GeneralChat", "ProjectChat"];
const NOTIFICATION_BUFFER_LENGTH = 5;

export class NotificationService implements Transactable<NotificationService> {
  private notificiation_repo: NotificationRepository;
  private email_service: IEmailService;
  private user_service: UserService;
  private preference_service: PreferenceService;
  private transaction_manager: TransactionManager;

  constructor(
    notification_repo: NotificationRepository,
    email_service: IEmailService,
    user_service: UserService,
    preference_service: PreferenceService,
    transaction_manager: TransactionManager,
  ) {
    this.notificiation_repo = notification_repo;
    this.email_service = email_service;
    this.user_service = user_service;
    this.preference_service = preference_service;
    this.transaction_manager = transaction_manager;
  }

  factory = (tm: TransactionManager) => notificationServiceFactory(tm, this.email_service);

  async addNotification(opts: {
    title: string;
    description: string;
    user_id: number;
    type: NotificationTypes; // informasi resource untuk notification ini
    type_id?: number; // opsional - id resource tersebut
  }) {
    const { title, description, user_id, type } = opts;
    let pref: Awaited<ReturnType<NotificationService["getNotificationPreference"]>> | undefined;

    const result = await this.transaction_manager.transaction(
      this as NotificationService,
      async (serv) => {
        const user = await serv.user_service.getUserDetail(user_id);
        if (!user) {
          throw new NotFoundError("Gagal menemukan pengguna tersebut!");
        }

        pref = await serv.getNotificationPreference(user_id, type);
        if (pref === "off") {
          return;
        }

        return await serv.notificiation_repo.addNotification(opts);
      },
    );

    if (pref != undefined && pref === "email") {
      this.sendMail(user_id, type, {
        subject: title,
        html_content: description,
        text_content: description,
      }).catch((e) => {
        logger.error(`Gagal mengirimkan email kepada pengguna ${user_id}`, { error: e });
      });
    }

    return result;
  }

  async massUpdateNotification(read: boolean, user_id: number, sender_id: number) {
    return await this.transaction_manager.transaction(this as NotificationService, async (serv) => {
      const is_allowed = await serv.isAllowedToModifyUserNotification(user_id, sender_id);
      if (!is_allowed) {
        throw new AuthError("Anda tidak memiliki akses untuk melakukan hal ini!");
      }
      return await serv.notificiation_repo.massUpdateNotificationStatus(read, user_id);
    });
  }

  async updateNotification(notification_id: number, read: boolean, sender_id: number) {
    return await this.transaction_manager.transaction(this as NotificationService, async (serv) => {
      const is_allowed = await serv.isAllowedToModify(notification_id, sender_id);
      if (!is_allowed) {
        throw new AuthError("Anda tidak memiliki akses untuk melakukan hal ini!");
      }

      return await serv.notificiation_repo.updateNotification(notification_id, {
        read,
      });
    });
  }

  async getNotifications(opts: { user_id?: number; read?: boolean }) {
    return await this.transaction_manager.transaction(this as NotificationService, async (serv) => {
      return await serv.notificiation_repo.getNotifications(opts);
    });
  }

  async getNotification(notification_id: number) {
    return await this.transaction_manager.transaction(this as NotificationService, async (serv) => {
      return await serv.notificiation_repo.getNotification(notification_id);
    });
  }

  private async isAllowedToModify(notification_id: number, sender_id: number) {
    const notif = await this.notificiation_repo.getNotification(notification_id);
    if (!notif) {
      throw new NotFoundError("Notifikasi gagal ditemukan!");
    }
    return await this.isAllowedToModifyUserNotification(notif.user_id, sender_id);
  }

  private async isAllowedToModifyUserNotification(user_id: number, sender_id: number) {
    if (sender_id == user_id) {
      return true;
    }
    const is_admin = await this.user_service.isAdminUser(sender_id);
    return is_admin;
  }

  private async getNotificationPreference(user_id: number, notification_type: NotificationTypes) {
    const pref = await this.preference_service.getUserPreference(user_id);
    const key = getPreferenceKeyFromNotificationType(notification_type);
    return pref[key];
  }

  private async sendMail(
    user_id: number,
    type: NotificationTypes,
    email: {
      subject: string;
      html_content: string;
      text_content: string;
    },
  ) {
    return await this.transaction_manager.transaction(this as NotificationService, async (serv) => {
      const startDate = dayjs().startOf("week").toDate();
      const endDate = dayjs().endOf("week").toDate();
      const user = await serv.user_service.getUserDetail(user_id);
      if (user == null) {
        throw new NotFoundError("Gagal menemukan pengguna tersebut!");
      }
      if (user.user_email == null) {
        return;
      }

      const unread_notifs = await serv.notificiation_repo.getNotifications({
        user_id,
        startDate,
        endDate,
        read: false,
      });

      const is_bufferred_type = NOTIFICATION_TYPE_TO_BUFFER.includes(type);

      // send if there are no notifications
      if (unread_notifs.length === 1 || !is_bufferred_type) {
        logger.info(`Sending email notification to ${user_id}`, {
          unread_notifications: unread_notifs.length,
        });
        return await serv.email_service.send_email({
          ...email,
          sender: "noreply",
          target: user.user_email,
        });
      }

      // otherwise buffer the message
      const bufs = await serv.notificiation_repo.getNotificationBuffer({
        startDate,
        endDate,
        user_id,
      });

      if (bufs.length === 0 && unread_notifs.length >= NOTIFICATION_BUFFER_LENGTH) {
        logger.info(`Sending buffer email to ${user_id}`, {
          unread_notifications: unread_notifs.length,
          buffer_mark: bufs.length,
        });
        await serv.email_service.send_email({
          target: user.user_email,
          sender: "noreply",
          subject: `${unread_notifs.length} Pesan Masuk di Dev4You`,
          html_content: `Anda memiliki ${unread_notifs.length} pesan masuk yang belum dibaca di Dev4You!`,
          text_content: `Anda memiliki ${unread_notifs.length} pesan masuk yang belum dibaca di Dev4You!`,
        });

        await serv.notificiation_repo.addNotificationBufferMark({
          type,
          user_id,
        });
      }
    });
  }
}
