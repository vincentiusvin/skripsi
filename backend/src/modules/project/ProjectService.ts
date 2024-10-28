import { AuthError, ClientError, NotFoundError } from "../../helpers/error.js";
import { Transactable, TransactionManager } from "../../helpers/transaction/transaction.js";
import {
  NotificationService,
  notificationServiceFactory,
} from "../notification/NotificationService.js";
import { OrgService, orgServiceFactory } from "../organization/OrgService.js";
import { PreferenceService, preferenceServiceFactory } from "../preferences/PreferenceService.js";
import { UserService, userServiceFactory } from "../user/UserService.js";
import { ProjectRoles } from "./ProjectMisc.js";
import { ProjectRepository } from "./ProjectRepository.js";

export function projectServiceFactory(transaction_manager: TransactionManager) {
  const db = transaction_manager.getDB();
  const project_repo = new ProjectRepository(db);
  const user_service = userServiceFactory(transaction_manager);
  const preference_service = preferenceServiceFactory(transaction_manager);
  const notification_service = notificationServiceFactory(transaction_manager);
  const org_service = orgServiceFactory(transaction_manager);
  const project_service = new ProjectService(
    project_repo,
    org_service,
    user_service,
    notification_service,
    preference_service,
    transaction_manager,
  );
  return project_service;
}

export class ProjectService implements Transactable<ProjectService> {
  private project_repo: ProjectRepository;
  private org_service: OrgService;
  private user_service: UserService;
  private notification_service: NotificationService;
  private preference_service: PreferenceService;
  private transaction_manager: TransactionManager;

  constructor(
    repo: ProjectRepository,
    org_service: OrgService,
    user_service: UserService,
    notification_service: NotificationService,
    preference_service: PreferenceService,
    transaction_manager: TransactionManager,
  ) {
    this.project_repo = repo;
    this.org_service = org_service;
    this.user_service = user_service;
    this.notification_service = notification_service;
    this.preference_service = preference_service;
    this.transaction_manager = transaction_manager;
  }
  factory = projectServiceFactory;

  async getMemberRole(project_id: number, user_id: number) {
    return await this.transaction_manager.transaction(this as ProjectService, async (serv) => {
      const is_app_admin = await serv.user_service.isAdminUser(user_id);
      if (is_app_admin) {
        return "Admin";
      }
      return await serv.project_repo.getMemberRole(project_id, user_id);
    });
  }

  /**
   * Kalau ngurusin dirinya sendiri (user_id dia), maka cuma boleh role "Pending".
   * Kalau orang organisasi, langsung kita naikin ke "Admin".
   * Kalau bukan, kita jadiin "Pending".
   *
   * Juga boleh accept
   *
   * Selain itu, admin boleh nerima user atau invite user.
   */
  async assignMember(
    project_id: number,
    user_id: number,
    sender_id: number,
    target_role: ProjectRoles,
  ) {
    return await this.transaction_manager.transaction(this as ProjectService, async (serv) => {
      const sender_role = await serv.getMemberRole(project_id, sender_id);
      const project = await serv.project_repo.getProjectByID(project_id);
      if (!project) {
        throw new NotFoundError("Gagal menemukan projek tersebut!");
      }

      const org = await serv.org_service.getOrgByID(project.org_id);
      if (!org) {
        throw new NotFoundError("Gagal menemukan organisasi projek!");
      }
      const target_user_role = await serv.getMemberRole(project_id, user_id);

      if (sender_id === user_id) {
        if (target_role === "Pending" && target_user_role === "Not Involved") {
          const user_org_role = await serv.org_service.getMemberRole(org.org_id, user_id);
          if (user_org_role === "Admin") {
            return await serv.promoteOrgAdminAsProjectAdmin(project_id, user_id);
          } else {
            if (!project.project_archived) {
              return await serv.storePendingDevRequest(project_id, user_id);
            } else {
              throw new AuthError("Proyek ini sudah diarsipkan dan tidak dapat dilamar!");
            }
          }
        }
        if (target_role === "Dev" && target_user_role === "Invited") {
          return await serv.promoteInvitedDev(project_id, user_id);
        }
      }

      if (sender_role === "Admin") {
        if (target_role === "Dev" && target_user_role === "Pending") {
          return await serv.acceptPendingDevRequest(project_id, user_id);
        }
        if (target_role === "Invited" && target_user_role === "Not Involved") {
          return await serv.inviteDevToJoin(project_id, user_id);
        }
      }

      throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
    });
  }

  async tryUnassignMember(project_id: number, user_id: number, sender_id: number) {
    const sender_role = await this.getMemberRole(project_id, sender_id);
    if (sender_role !== "Admin" && sender_id !== user_id) {
      throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
    }
    await this.unassignMember(project_id, user_id);
  }

  getProjects(filter?: {
    page?: number;
    limit?: number;
    org_id?: number;
    user_id?: number;
    keyword?: string;
  }) {
    return this.project_repo.getProjects(filter);
  }

  getProjectByID(project_id: number) {
    return this.project_repo.getProjectByID(project_id);
  }

  async addProject(
    obj: {
      project_name: string;
      org_id: number;
      project_desc: string;
      category_id?: number[];
    },
    sender_id: number,
  ) {
    return await this.transaction_manager.transaction(this as ProjectService, async (serv) => {
      const sender_role = await serv.org_service.getMemberRole(obj.org_id, sender_id);
      if (sender_role !== "Admin") {
        throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
      }
      return await serv.project_repo.addProject(obj);
    });
  }

  async updateProject(
    project_id: number,
    obj: {
      project_name?: string;
      project_desc?: string;
      category_id?: number[];
      project_archived?: boolean;
    },
    sender_id: number,
  ) {
    return await this.transaction_manager.transaction(this as ProjectService, async (serv) => {
      const sender_role = await serv.getMemberRole(project_id, sender_id);
      if (sender_role !== "Admin") {
        throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
      }
      return await serv.project_repo.updateProject(project_id, obj);
    });
  }

  async deleteProject(project_id: number, sender_id: number) {
    return await this.transaction_manager.transaction(this as ProjectService, async (serv) => {
      const sender_role = await serv.getMemberRole(project_id, sender_id);
      if (sender_role !== "Admin") {
        throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
      }
      return serv.project_repo.deleteProject(project_id);
    });
  }

  async getCategories() {
    return await this.project_repo.getCategories();
  }

  async getEvents(project_id: number) {
    return await this.project_repo.getEvents(project_id);
  }

  async addEvent(project_id: number, event: string) {
    return await this.project_repo.addEvent(project_id, event);
  }

  private async unassignMember(project_id: number, user_id: number) {
    await this.project_repo.unassignMember(project_id, user_id);
    await this.removeUserEvent(project_id, user_id);
  }

  private async promoteOrgAdminAsProjectAdmin(project_id: number, user_id: number) {
    await this.project_repo.assignMember(project_id, user_id, "Admin");
    await this.addAdminEvent(project_id, user_id);
  }

  private async inviteDevToJoin(project_id: number, user_id: number) {
    const pref = await this.preference_service.getUserPreference(user_id);
    if (pref.project_invite === "off") {
      throw new ClientError("Pengguna ini tidak menerima undangan proyek.");
    }
    await this.project_repo.assignMember(project_id, user_id, "Invited");
    await this.sendInvitationNotification(user_id, project_id);
  }

  private async storePendingDevRequest(project_id: number, user_id: number) {
    await this.project_repo.assignMember(project_id, user_id, "Pending");

    await this.sendDevRequestNotification(user_id, project_id);
  }

  private async promoteInvitedDev(project_id: number, user_id: number) {
    await this.project_repo.assignMember(project_id, user_id, "Dev");

    await this.addDevEvent(project_id, user_id);
  }

  private async acceptPendingDevRequest(project_id: number, user_id: number) {
    await this.project_repo.assignMember(project_id, user_id, "Dev");

    await this.sendAcceptanceNotification(user_id, project_id);
    await this.addDevEvent(project_id, user_id);
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
    await this.addEvent(project_id, `Pengguna "${user.user_name}" ditambahkan menjadi developer.`);
  }

  private async removeUserEvent(project_id: number, user_id: number) {
    const user = await this.user_service.getUserDetail(user_id);
    if (!user) {
      throw new Error(`Gagal menemukan pengguna ${user_id}`);
    }
    await this.addEvent(
      project_id,
      `Pengguna "${user.user_name}" berhenti menjadi anggota proyek.`,
    );
  }

  private async addAdminEvent(project_id: number, user_id: number) {
    const user = await this.user_service.getUserDetail(user_id);
    if (!user) {
      throw new Error(`Gagal menemukan pengguna ${user_id}`);
    }
    await this.addEvent(project_id, `Pengguna "${user.user_name}" ditambahkan menjadi admin.`);
  }
}
