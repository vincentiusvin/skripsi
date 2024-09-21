import { AuthError, NotFoundError } from "../../helpers/error.js";
import { NotificationService } from "../notification/NotificationService.js";
import { OrgService } from "../organization/OrgService.js";
import { ProjectRoles } from "./ProjectMisc.js";
import { ProjectRepository } from "./ProjectRepository.js";

export class ProjectService {
  private project_repo: ProjectRepository;
  private org_service: OrgService;
  private notification_service: NotificationService;
  constructor(
    repo: ProjectRepository,
    org_service: OrgService,
    notification_service: NotificationService,
  ) {
    this.project_repo = repo;
    this.org_service = org_service;
    this.notification_service = notification_service;
  }

  getMemberRole(project_id: number, user_id: number) {
    return this.project_repo.getMemberRole(project_id, user_id);
  }

  async sendAcceptanceNotification(user_id: number, project_id: number) {
    const project = await this.getProjectByID(project_id);
    if (!project) {
      return;
    }
    return this.notification_service.addNotification({
      title: `Penerimaan Developer di ${project.project_name}`,
      user_id,
      description: `Anda telah diterima sebagai "Developer" di "${project.project_name}" dan dapat mulai berkontribusi.`,
      type: "ProjectManage",
      type_id: project_id,
    });
  }

  async sendInvitationNotification(user_id: number, project_id: number) {
    const project = await this.getProjectByID(project_id);
    if (!project) {
      return;
    }
    return this.notification_service.addNotification({
      title: `Undangan Developer di ${project.project_name}`,
      user_id,
      description: `Anda diundang untuk menjadi "Developer" di "${project.project_name}".
Anda dapat menerima tawaran ini dan berkontribusi di projek tersebut.`,
      type: "ProjectManage",
      type_id: project_id,
    });
  }

  async sendDevRequestNotification(dev_id: number, project_id: number) {
    const project = await this.getProjectByID(project_id);
    if (!project) {
      return;
    }
    const members = project.project_members.filter((x) => x.role === "Admin");
    for (const org_user_id of members) {
      return this.notification_service.addNotification({
        title: `Lamaran Developer di ${project.project_name}`,
        user_id: org_user_id.user_id,
        description: `Terdapat pengguna yang ingin menjadi "Developer" di organisasi "${project.project_name}" yang anda kelola.
Anda dapat menerima atau menolak permintaan tersebut.`,
        type: "ProjectManage",
        type_id: project_id,
      });
    }
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
    const sender_role = await this.getMemberRole(project_id, sender_id);
    const project = await this.project_repo.getProjectByID(project_id);
    if (!project) {
      throw new NotFoundError("Gagal menemukan projek tersebut!");
    }

    const org = await this.org_service.getOrgByID(project.org_id);
    if (!org) {
      throw new NotFoundError("Gagal menemukan organisasi projek!");
    }
    const target_user_role = await this.getMemberRole(project_id, user_id);

    if (sender_id === user_id) {
      if (target_role === "Pending" && target_user_role === "Not Involved") {
        const user_org_role = await this.org_service.getMemberRole(org.org_id, user_id);
        if (user_org_role === "Admin") {
          return this.project_repo.assignMember(project_id, user_id, "Admin");
        } else {
          const result = this.project_repo.assignMember(project_id, user_id, "Pending");
          await this.sendDevRequestNotification(user_id, project_id);
          return result;
        }
      }
      if (target_role === "Dev" && target_user_role === "Invited") {
        return this.project_repo.assignMember(project_id, user_id, "Dev");
      }
    }

    if (sender_role === "Admin") {
      if (target_role === "Dev" && target_user_role === "Pending") {
        const result = await this.project_repo.assignMember(project_id, user_id, "Dev");
        await this.sendAcceptanceNotification(user_id, project_id);
        return result;
      }
      if (target_role === "Invited" && target_user_role === "Not Involved") {
        const result = await this.project_repo.assignMember(project_id, user_id, "Invited");
        await this.sendInvitationNotification(user_id, project_id);
        return result;
      }
    }

    throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
  }

  async unassignMember(project_id: number, user_id: number, sender_id: number) {
    const sender_role = await this.getMemberRole(project_id, sender_id);
    if (sender_role !== "Admin" && sender_id !== user_id) {
      throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
    }
    return await this.project_repo.unassignMember(project_id, user_id);
  }

  getProjects(filter?: { org_id?: number; user_id?: number; keyword?: string }) {
    return this.project_repo.getProjects(filter);
  }

  getProjectByID(project_id: number) {
    return this.project_repo.getProjectByID(project_id);
  }

  getAllMembers(project_id: number) {
    return this.project_repo.getMembers(project_id);
  }

  isInvolvedRole(role: ProjectRoles) {
    return role === "Dev" || role === "Admin";
  }

  async getInvolvedMembers(project_id: number) {
    const members = await this.project_repo.getMembers(project_id);
    return members.filter((x) => this.isInvolvedRole(x.role));
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
    const sender_role = await this.org_service.getMemberRole(obj.org_id, sender_id);
    if (sender_role !== "Admin") {
      throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
    }
    return await this.project_repo.addProject(obj);
  }

  async updateProject(
    project_id: number,
    obj: { project_name?: string; project_desc?: string; category_id?: number[] },
    sender_id: number,
  ) {
    const sender_role = await this.getMemberRole(project_id, sender_id);
    if (sender_role !== "Admin") {
      throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
    }
    return await this.project_repo.updateProject(project_id, obj);
  }

  async deleteProject(project_id: number, sender_id: number) {
    const sender_role = await this.getMemberRole(project_id, sender_id);
    if (sender_role !== "Admin") {
      throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
    }
    return this.project_repo.deleteProject(project_id);
  }

  getCategories() {
    return this.project_repo.getCategories();
  }
}
