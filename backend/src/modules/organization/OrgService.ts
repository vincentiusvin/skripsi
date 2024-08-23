import { AuthError, ClientError } from "../../helpers/error.js";
import { OrgRoles } from "./OrgMisc.js";
import { OrgRepository } from "./OrgRepository.js";

export class OrgService {
  private org_repo: OrgRepository;
  constructor(repo: OrgRepository) {
    this.org_repo = repo;
  }

  async getOrgs(filter?: { user_id?: number }) {
    return await this.org_repo.getOrgs(filter);
  }

  async getOrgByID(id: number) {
    return await this.org_repo.getOrgsByID(id);
  }

  async getOrgByName(name: string) {
    return await this.org_repo.getOrgsByName(name);
  }

  async addOrg(
    obj: {
      org_name: string;
      org_description: string;
      org_address: string;
      org_phone: string;
      org_image?: string;
      org_categories?: number[];
    },
    firstUser: number,
  ) {
    const { org_name } = obj;
    const same_name = await this.getOrgByName(org_name);
    if (same_name != undefined) {
      throw new ClientError("Sudah ada organisasi dengan nama yang sama!");
    }
    return await this.org_repo.addOrg(obj, firstUser);
  }

  async updateOrg(
    id: number,
    obj: {
      org_name?: string;
      org_description?: string;
      org_address?: string;
      org_phone?: string;
      org_image?: string;
      org_category?: number[];
    },
  ) {
    const { org_name } = obj;
    if (org_name) {
      const same_name = await this.getOrgByName(org_name);
      if (same_name != undefined) {
        throw new ClientError("Sudah ada organisasi dengan nama yang sama!");
      }
    }
    return await this.org_repo.updateOrg(id, obj);
  }

  async getOrgCategories() {
    return await this.org_repo.getCategories();
  }

  async deleteOrg(id: number) {
    await this.org_repo.deleteOrg(id);
  }

  async getMemberRole(org_id: number, user_id: number) {
    return await this.org_repo.getMemberRole(org_id, user_id);
  }

  async assignMember(org_id: number, user_id: number, sender_id: number, role: OrgRoles) {
    const previous_role = await this.getMemberRole(org_id, user_id);
    const sender_role = await this.getMemberRole(org_id, sender_id);
    if (role === "Admin" && user_id === sender_id && previous_role === "Invited") {
      return await this.org_repo.assignMember(org_id, user_id, "Admin");
    }
    if (role === "Invited" && sender_role === "Admin" && previous_role === "Not Involved") {
      return await this.org_repo.assignMember(org_id, user_id, "Invited");
    }

    throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
  }

  async unassignMember(org_id: number, user_id: number, sender_id: number) {
    const sender_role = await this.getMemberRole(org_id, sender_id);
    if (sender_id === user_id || sender_role === "Admin") {
      return await this.org_repo.unassignMember(org_id, user_id);
    }
    throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
  }
}
