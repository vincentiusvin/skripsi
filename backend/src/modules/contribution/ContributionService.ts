import { ContributionRepository } from "./ContributionRepository";

export class ContributionService {
  private cont_repo: ContributionRepository;
  constructor(cont_repo: ContributionRepository) {
    this.cont_repo = cont_repo;
  }

  getContributionsByUserId(user_id: number) {
    return this.cont_repo.getContributionsByUserId(user_id);
  }

  getContributionByProjectId(project_id: number) {
    return this.cont_repo.getContributionsByProjectId(project_id);
  }

  getContributionDetail(contributions_id: number) {
    return this.cont_repo.getContributionsDetail(contributions_id);
  }

  async addContributions(
    obj: {
      cont_name: string;
      cont_description: string;
      cont_project_id: number;
    },
    firstUser: number,
  ) {
    return await this.cont_repo.addContributions(obj, firstUser);
  }

  async approveContributions(id: number) {
    return await this.cont_repo.approveContributions(id);
  }

  async rejectContributions(id: number) {
    return await this.cont_repo.rejectContributions(id);
  }
}
