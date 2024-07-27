import { AuthError, NotFoundError } from "../../helpers/error.js";
import { OrgService } from "../organization/OrgService.js";
import { ProjectRoles } from "./ProjectMisc.js";
import { ProjectRepository } from "./ProjectRepository.js";

export class ProjectService {
  private project_repo: ProjectRepository;
  private org_service: OrgService;
  constructor(repo: ProjectRepository, org_service: OrgService) {
    this.project_repo = repo;
    this.org_service = org_service;
  }

  getMemberRole(project_id: number, user_id: number) {
    return this.project_repo.getMemberRole(project_id, user_id);
  }

  /**
   * Kalau sender admin, kita turutin apapun maunya.
   *
   * Selain itu cuma boleh ngurusin dirinya sendiri (user_id dia doang) DAN cuma boleh role "Pending".
   *
   * Kalau orang organisasi, langsung kita naikin ke "Admin".
   * Kalau bukan, kita jadiin "Pending".
   */
  async assignMember(project_id: number, user_id: number, sender_id: number, role: ProjectRoles) {
    const sender_role = await this.getMemberRole(project_id, sender_id);
    const project = await this.project_repo.getProjectByID(project_id);
    if (!project) {
      throw new NotFoundError("Gagal menemukan projek tersebut!");
    }

    const org = await this.org_service.getOrgByID(project.org_id);
    if (!org) {
      throw new NotFoundError("Gagal menemukan organisasi projek!");
    }

    if (sender_role === "Admin") {
      return this.project_repo.assignMember(project_id, user_id, role);
    }

    if (role === "Pending") {
      const user_is_org_member = org.org_users.some((x) => x.user_id === sender_id);
      if (user_is_org_member) {
        return this.project_repo.assignMember(project_id, user_id, "Admin");
      } else {
        return this.project_repo.assignMember(project_id, user_id, "Pending");
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

  addProject(obj: {
    project_name: string;
    org_id: number;
    project_desc: string;
    category_id?: number[];
  }) {
    return this.project_repo.addProject(obj);
  }

  getCategories() {
    return this.project_repo.getCategories();
  }

  getBuckets(project_id: number) {
    return this.project_repo.getProjectBuckets(project_id);
  }

  addBucket(project_id: number, name: string) {
    return this.project_repo.addBucket(project_id, name);
  }
}
