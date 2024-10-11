import { AuthError, NotFoundError } from "../../helpers/error.js";
import { OrgService } from "../organization/OrgService.js";
import { UserService } from "../user/UserService.js";
import { ProjectRoles } from "./ProjectMisc.js";
import { ProjectRepository } from "./ProjectRepository.js";

export class ProjectService {
  protected project_repo: ProjectRepository;
  protected org_service: OrgService;
  protected user_service: UserService;

  constructor(repo: ProjectRepository, org_service: OrgService, user_service: UserService) {
    this.project_repo = repo;
    this.org_service = org_service;
    this.user_service = user_service;
  }

  async getMemberRole(project_id: number, user_id: number) {
    const is_app_admin = await this.user_service.isAdminUser(user_id);
    if (is_app_admin) {
      return "Admin";
    }
    return await this.project_repo.getMemberRole(project_id, user_id);
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
          return await this.promoteOrgAdminAsProjectAdmin(project_id, user_id);
        } else {
          return await this.storePendingDevRequest(project_id, user_id);
        }
      }
      if (target_role === "Dev" && target_user_role === "Invited") {
        return await this.promoteInvitedDev(project_id, user_id);
      }
    }

    if (sender_role === "Admin") {
      if (target_role === "Dev" && target_user_role === "Pending") {
        return await this.acceptPendingDevRequest(project_id, user_id);
      }
      if (target_role === "Invited" && target_user_role === "Not Involved") {
        return await this.inviteDevToJoin(project_id, user_id);
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

  async getCategories() {
    return await this.project_repo.getCategories();
  }

  async getEvents(project_id: number) {
    return await this.project_repo.getEvents(project_id);
  }

  async addEvent(project_id: number, event: string) {
    return await this.project_repo.addEvent(project_id, event);
  }

  protected async promoteOrgAdminAsProjectAdmin(project_id: number, user_id: number) {
    return this.project_repo.assignMember(project_id, user_id, "Admin");
  }

  protected async inviteDevToJoin(project_id: number, user_id: number) {
    return await this.project_repo.assignMember(project_id, user_id, "Invited");
  }

  protected async storePendingDevRequest(project_id: number, user_id: number) {
    return await this.project_repo.assignMember(project_id, user_id, "Pending");
  }

  protected async promoteInvitedDev(project_id: number, user_id: number) {
    return await this.project_repo.assignMember(project_id, user_id, "Dev");
  }

  // sama kek atas, cuma dipecah jadi dua biar bisa dioverride
  protected async acceptPendingDevRequest(project_id: number, user_id: number) {
    return await this.project_repo.assignMember(project_id, user_id, "Dev");
  }
}
