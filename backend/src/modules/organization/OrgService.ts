import { ClientError } from "../../helpers/error.js";
import { OrgRepository } from "./OrgRepository.js";

export class OrgService {
  private org_repo: OrgRepository;
  constructor(repo: OrgRepository) {
    this.org_repo = repo;
  }

  async getOrgs() {
    return await this.org_repo.getOrgs();
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
}
