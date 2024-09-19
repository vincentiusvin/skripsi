import { NotificationRepository } from "./NotificationRepository.js";

export class NotificationService {
  private notificiation_repo: NotificationRepository;
  constructor(notification_repo: NotificationRepository) {
    this.notificiation_repo = notification_repo;
  }
  async addNotification(opts: {
    title: string;
    description: string;
    type: string;
    user_id: number;
  }) {
    return await this.notificiation_repo.addNotification(opts);
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
