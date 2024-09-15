import { ContributionRepository } from "./ContributionRepository";

export class ContributionService {
  private cont_repo: ContributionRepository;
  constructor(cont_repo: ContributionRepository) {
    this.cont_repo = cont_repo;
  }

  getContributions(params: { user_id?: number; project_id?: number }) {
    return this.cont_repo.getContributions(params.user_id, params.project_id);
  }

  getContributionDetail(contributions_id: number) {
    return this.cont_repo.getContributionsDetail(contributions_id);
  }

  async addContributions(
    obj: {
      contributions_name: string;
      contributions_description: string;
      contributions_project_id: number;
    },
    users: number[],
  ) {
    return await this.cont_repo.addContributions(obj, users);
  }

  async statusContributions(
    id: number,
    obj: {
      contributions_name?: string;
      contributions_description?: string;
      contributions_project_id?: number;
      user_id?: number[];
      status?: string;
    },
  ) {
    return await this.cont_repo.statusContributions(id, obj);
  }
}
