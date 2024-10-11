import { NotificationService } from "../notification/NotificationService.js";
import { OrgService } from "../organization/OrgService.js";
import { UserService } from "../user/UserService.js";
import { ProjectRepository } from "./ProjectRepository.js";
import { ProjectService } from "./ProjectService.js";

/**
 * Handle side effects buat project service.
 * Hal-hal yang nggak "core".
 * Notif & timeline event
 * Abstrak lagi jadi decorator atau observer kalau butuh.
 */
export class ProjectServiceEffects extends ProjectService {
  private notification_service: NotificationService;
  constructor(
    repo: ProjectRepository,
    org_service: OrgService,
    user_service: UserService,
    notification_service: NotificationService,
  ) {
    super(repo, org_service, user_service);
    this.notification_service = notification_service;
    this.user_service = user_service;
  }

  private async sendAcceptanceNotification(user_id: number, project_id: number) {
    const project = await this.getProjectByID(project_id);
    if (!project) {
      return;
    }
    return this.notification_service.addNotification({
      title: `Penerimaan Developer di ${project.project_name}`,
      user_id,
      description: `Anda telah diterima sebagai "Developer" di projek "${project.project_name}" dan dapat mulai berkontribusi.`,
      type: "ProjectManage",
      type_id: project_id,
    });
  }

  private async sendInvitationNotification(user_id: number, project_id: number) {
    const project = await this.getProjectByID(project_id);
    if (!project) {
      return;
    }
    return this.notification_service.addNotification({
      title: `Undangan Developer di ${project.project_name}`,
      user_id,
      description: `Anda diundang untuk menjadi "Developer" di projek "${project.project_name}".
Anda dapat menerima tawaran ini dan berkontribusi di projek tersebut.`,
      type: "ProjectManage",
      type_id: project_id,
    });
  }

  private async sendDevRequestNotification(dev_id: number, project_id: number) {
    const project = await this.getProjectByID(project_id);
    if (!project) {
      return;
    }
    const members = project.project_members.filter((x) => x.role === "Admin");
    for (const org_user_id of members) {
      return this.notification_service.addNotification({
        title: `Lamaran Developer di ${project.project_name}`,
        user_id: org_user_id.user_id,
        description: `Terdapat pengguna yang ingin menjadi "Developer" di projek "${project.project_name}" yang anda kelola.
Anda dapat menerima atau menolak permintaan tersebut.`,
        type: "ProjectManage",
        type_id: project_id,
      });
    }
  }

  private async addDevEvent(project_id: number, user_id: number) {
    const user = await this.user_service.getUserDetail(user_id);
    if (!user) {
      throw new Error(`Gagal menemukan pengguna ${user_id}`);
    }
    await this.addEvent(project_id, `Pengguna ${user.user_name} ditambahkan menjadi developer.`);
  }

  private async removeUserevent(project_id: number, user_id: number) {
    const user = await this.user_service.getUserDetail(user_id);
    if (!user) {
      throw new Error(`Gagal menemukan pengguna ${user_id}`);
    }
    await this.addEvent(project_id, `Pengguna ${user.user_name} berhenti menjadi anggota proyek.`);
  }

  private async addAdminEvent(project_id: number, user_id: number) {
    const user = await this.user_service.getUserDetail(user_id);
    if (!user) {
      throw new Error(`Gagal menemukan pengguna ${user_id}`);
    }
    await this.addEvent(project_id, `Pengguna ${user.user_name} ditambahkan menjadi admin.`);
  }

  protected override async inviteDevToJoin(project_id: number, user_id: number) {
    const result = await super.inviteDevToJoin(project_id, user_id);
    await this.sendInvitationNotification(user_id, project_id);
    return result;
  }

  protected override async storePendingDevRequest(project_id: number, user_id: number) {
    const result = await super.storePendingDevRequest(project_id, user_id);
    await this.sendDevRequestNotification(user_id, project_id);
    return result;
  }

  protected override async acceptPendingDevRequest(project_id: number, user_id: number) {
    const result = await super.acceptPendingDevRequest(project_id, user_id);
    await this.sendAcceptanceNotification(user_id, project_id);
    await this.addDevEvent(project_id, user_id);
    return result;
  }

  protected override async promoteInvitedDev(project_id: number, user_id: number) {
    const result = await super.promoteInvitedDev(project_id, user_id);
    await this.addDevEvent(project_id, user_id);
    return result;
  }

  override async unassignMember(project_id: number, user_id: number, sender_id: number) {
    const result = await super.unassignMember(project_id, user_id, sender_id);
    await this.removeUserevent(project_id, user_id);
    return result;
  }

  protected override async promoteOrgAdminAsProjectAdmin(project_id: number, user_id: number) {
    const result = await super.promoteOrgAdminAsProjectAdmin(project_id, user_id);
    await this.addAdminEvent(project_id, user_id);
    return result;
  }
}
