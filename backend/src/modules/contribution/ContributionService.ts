import { AuthError, NotFoundError } from "../../helpers/error.js";
import { ProjectService } from "../project/ProjectService.js";
import { ContributionStatus } from "./ContributionMisc.js";
import { Contribution, ContributionRepository } from "./ContributionRepository";

// Flow status:
// pending -> approved, revision, rejected
// approved, revision -> pending (boleh balik pending kalau udah approved)
// rejected -> end

export class ContributionService {
  private cont_repo: ContributionRepository;
  private project_service: ProjectService;
  constructor(cont_repo: ContributionRepository, project_service: ProjectService) {
    this.cont_repo = cont_repo;
    this.project_service = project_service;
  }

  async isAllowedToView(contribution_id: number, sender_id: number) {
    const contrib = await this.cont_repo.getContributionsDetail(contribution_id);
    if (!contrib) {
      throw new NotFoundError("Gagal menemukan kontribusi!");
    }

    if (contrib.status === "Approved") {
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

  async getContributionDetail(contribution_id: number, sender_id: number) {
    const allowed = await this.isAllowedToView(contribution_id, sender_id);
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
    // Harus dibuat sama orang projek, tapi boleh include orang di luar.
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

    await this.project_service.getProjectByID(obj.project_id);
    return await this.cont_repo.addContributions({ ...obj, status: "Pending" }, users);
  }

  async updateContribution(
    id: number,
    obj: {
      name?: string;
      description?: string;
      project_id?: number;
      user_ids?: number[];
      status?: ContributionStatus;
    },
    sender_id: number,
  ) {
    const old_data = await this.getContributionDetail(id, sender_id);
    if (old_data == undefined) {
      throw new NotFoundError("Gagal menemukan kontribusi tersebut!");
    }

    const { status } = obj;
    if (status === "Approved" || status === "Rejected" || status === "Revision") {
      await this.approveContribution(status, old_data, sender_id);
    } else {
      await this.reviseContribution(old_data, { ...obj, status }, sender_id);
    }
  }

  private async approveContribution(
    status: "Approved" | "Revision" | "Rejected",
    contrib: Contribution,
    user_id: number,
  ) {
    if (contrib.status !== "Pending") {
      throw new AuthError("Anda tidak boleh mengubah status kontribusi yang sudah diselesaikan!");
    }
    const role = await this.project_service.getMemberRole(contrib.project_id, user_id);
    if (role !== "Admin") {
      throw new AuthError("Anda tidak memiliki akses untuk melakukan approval!");
    }
    if (contrib.user_ids.map((x) => x.user_id).includes(user_id)) {
      throw new AuthError("Anda tidak boleh memberikan approval untuk kontribusi anda sendiri!");
    }
    await this.cont_repo.updateContribution(contrib.id, {
      status,
    });
  }

  private async reviseContribution(
    old_contrib: Contribution,
    revision: {
      name?: string;
      description?: string;
      project_id?: number;
      user_ids?: number[];
      status?: "Pending";
    },
    user_id: number,
  ) {
    if (!old_contrib.user_ids.map((x) => x.user_id).includes(user_id)) {
      throw new AuthError("Anda tidak boleh mengubah kontribusi milik orang lain!");
    }
    if (old_contrib.status !== "Pending" && revision.status == undefined) {
      throw new AuthError("Anda hanya boleh mengubah kontribusi yang bersifat pending!");
    }
    if (revision.user_ids != undefined && !revision.user_ids.includes(user_id)) {
      throw new AuthError("Anda tidak memiliki akses untuk menambahkan kontribusi orang lain!");
    }
    if (old_contrib.status === "Rejected") {
      throw new AuthError("Anda tidak dapat mengubah kontribusi yang sudah ditolak!");
    }
    await this.cont_repo.updateContribution(old_contrib.id, revision);
  }
}
