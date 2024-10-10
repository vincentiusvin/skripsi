import { NotificationService } from "../notification/NotificationService.js";
import { UserService } from "../user/UserService.js";
import { OrgRepository } from "./OrgRepository.js";
import { OrgService } from "./OrgService.js";

/**
 * Handle side effects buat org service.
 * Hal-hal yang nggak "core".
 * Notif & timeline event.
 * Abstrak lagi jadi decorator atau observer kalau butuh.
 */
export class OrgServiceEffects extends OrgService {
  private notification_service: NotificationService;

  constructor(
    repo: OrgRepository,
    user_service: UserService,
    notification_service: NotificationService,
  ) {
    super(repo, user_service);
    this.notification_service = notification_service;
  }

  private async sendInvitationNotification(user_id: number, org_id: number) {
    const org = await this.getOrgByID(org_id);
    if (!org) {
      return;
    }
    return this.notification_service.addNotification({
      title: `Undangan Admin di ${org.org_id}`,
      user_id,
      description: `Anda diundang untuk menjadi "Admin" di organisasi "${org.org_name}".
Anda dapat menerima tawaran ini dan mengelola projek yang dijalankan oleh organisasi.`,
      type: "OrgManage",
      type_id: org_id,
    });
  }

  protected override async storeAdminInvite(org_id: number, user_id: number): Promise<void> {
    const result = super.storeAdminInvite(org_id, user_id);
    await this.sendInvitationNotification(user_id, org_id);
    return result;
  }
}
