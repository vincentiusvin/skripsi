import { AuthError, NotFoundError } from "../../helpers/error.js";
import { ProjectService } from "../project/ProjectService.js";
import { ContributionRepository } from "./ContributionRepository";

export class ContributionService {
  private cont_repo: ContributionRepository;
  private project_service: ProjectService;
  constructor(cont_repo: ContributionRepository, project_service: ProjectService) {
    this.cont_repo = cont_repo;
    this.project_service = project_service;
  }

  async isAllowedTo(action: "View" | "Edit", contribution_id: number, sender_id: number) {
    const contrib = await this.cont_repo.getContributionsDetail(contribution_id);
    if (!contrib) {
      throw new NotFoundError("Gagal menemukan kontribusi!");
    }

    if (contrib.status === "Accepted" && action === "View") {
      return true;
    }

    if (contrib.user_ids.map((x) => x.user_id).includes(sender_id)) {
      return true;
    }

    const sender_project_role = await this.project_service.getMemberRole(
      contrib.project_id,
      sender_id,
    );

    if (sender_project_role === "Admin") {
      return true;
    }

    return false;
  }

  async getContributions(params: { user_id?: number; project_id?: number }, sender_id: number) {
    const result = await this.cont_repo.getContributions(params.user_id, params.project_id);

    const filter_result = await Promise.all(
      result.map(async (contrib) => await this.isAllowedTo("View", contrib.id, sender_id)),
    );

    return result.filter((_, i) => filter_result[i]);
  }

  async getContributionDetail(contribution_id: number, sender_id: number) {
    const allowed = await this.isAllowedTo("View", contribution_id, sender_id);
    if (!allowed) {
      throw new AuthError("Anda tidak memiliki akses untuk membaca kontribusi ini!");
    }
    return this.cont_repo.getContributionsDetail(contribution_id);
  }

  async addContributions(
    obj: {
      name: string;
      description: string;
      project_id: number;
    },
    users: number[],
    sender_id: number,
  ) {
    const is_member = await this.project_service.getMemberRole(obj.project_id, sender_id);
    if (is_member !== "Admin" && is_member !== "Dev") {
      throw new AuthError(
        "Anda tidak memiliki akses untuk menambahkan kontribusi pada proyek ini!",
      );
    }

    if (is_member === "Dev") {
      if (!users.includes(sender_id)) {
        throw new AuthError(
          "Developer tidak memiliki akses untuk menambahkan kontribusi orang lain!",
        );
      }
    }

    return await this.cont_repo.addContributions({ ...obj, status: "Pending" }, users);
  }

  async updateContribution(
    id: number,
    obj: {
      name?: string;
      description?: string;
      project_id?: number;
      user_ids?: number[];
      status?: string;
    },
    sender_id: number,
  ) {
    const allowed = await this.isAllowedTo("Edit", id, sender_id);
    if (!allowed) {
      throw new AuthError("Anda tidak memiliki akses untuk mengubah kontribusi ini!");
    }
    return await this.cont_repo.updateContribution(id, obj);
  }
}
