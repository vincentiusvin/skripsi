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
      cont_name: string;
      cont_description: string;
      cont_project_id: number;
    },
    firstUser: number,
  ) {
    return await this.cont_repo.addContributions(obj, firstUser);
  }

  async statusContributions(id: number, status: string) {
    return await this.cont_repo.statusContributions(id, status);
  }
}
