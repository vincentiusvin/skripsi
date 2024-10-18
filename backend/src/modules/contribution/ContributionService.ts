import { NotFoundError } from "../../helpers/error.js";
import { ProjectService } from "../project/ProjectService.js";
import { ContributionRepository } from "./ContributionRepository";

export class ContributionService {
  private cont_repo: ContributionRepository;
  private project_service: ProjectService;
  constructor(cont_repo: ContributionRepository, project_service: ProjectService) {
    this.cont_repo = cont_repo;
    this.project_service = project_service;
  }

  async isAllowedToView(contribution_id: number, sender_id: number) {
    const contrib = await this.getContributionDetail(contribution_id);
    if (!contrib) {
      throw new NotFoundError("Gagal menemukan kontribusi!");
    }

    if (contrib.status === "Accepted") {
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
      result.map(async (contrib) => await this.isAllowedToView(contrib.id, sender_id)),
    );

    return result.filter((_, i) => filter_result[i]);
  }

  getContributionDetail(contributions_id: number) {
    return this.cont_repo.getContributionsDetail(contributions_id);
  }

  async addContributions(
    obj: {
      name: string;
      description: string;
      project_id: number;
    },
    users: number[],
  ) {
    return await this.cont_repo.addContributions(obj, users);
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
  ) {
    return await this.cont_repo.updateContribution(id, obj);
  }
}
