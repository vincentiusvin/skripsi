import { AuthError } from "../../helpers/error.js";
import { UserService } from "../user/UserService.js";
import { SuspensionRepository } from "./SuspensionRepository.js";

export class SuspensionService {
  private suspension_repo: SuspensionRepository;
  private user_service: UserService;
  constructor(suspension_repo: SuspensionRepository, user_service: UserService) {
    this.suspension_repo = suspension_repo;
    this.user_service = user_service;
  }

  async isAllowedToManage(user_id: number) {
    return await this.user_service.isAdminUser(user_id);
  }

  async addSuspension(
    opts: { reason: string; user_id: number; suspended_until: Date },
    sender_id: number,
  ) {
    const allowed = await this.isAllowedToManage(sender_id);
    if (!allowed) {
      throw new AuthError("Anda tidak diperbolehkan untuk mengatur suspensi!");
    }
    return await this.suspension_repo.addSuspension(opts);
  }

  async deleteSuspension(suspension_id: number, sender_id: number) {
    const allowed = await this.isAllowedToManage(sender_id);
    if (!allowed) {
      throw new AuthError("Anda tidak diperbolehkan untuk mengatur suspensi!");
    }
    return await this.suspension_repo.deleteSuspension(suspension_id);
  }

  async updateSuspension(
    suspension_id: number,
    opts: { reason?: string; user_id?: number; suspended_until?: Date },
    sender_id: number,
  ) {
    const allowed = await this.isAllowedToManage(sender_id);
    if (!allowed) {
      throw new AuthError("Anda tidak diperbolehkan untuk mengatur suspensi!");
    }
    return await this.suspension_repo.updateSuspension(suspension_id, opts);
  }

  async getSuspension(
    opts: {
      user_id?: number;
      expired_before?: Date;
      expired_after?: Date;
    },
    sender_id: number,
  ) {
    const allowed = await this.isAllowedToManage(sender_id);
    if (!allowed) {
      throw new AuthError("Anda tidak memiliki akses untuk melakukan hal ini!");
    }
    return await this.suspension_repo.getSuspension(opts);
  }

  async getSuspensionByID(suspension_id: number, sender_id: number) {
    const allowed = await this.isAllowedToManage(sender_id);
    if (!allowed) {
      throw new AuthError("Anda tidak memiliki akses untuk melakukan hal ini!");
    }
    return await this.suspension_repo.getSuspensionByID(suspension_id);
  }
}
