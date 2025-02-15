import dayjs from "dayjs";
import { AuthError } from "../../helpers/error.js";
import { TransactionManager } from "../../helpers/transaction/transaction.js";
import { UserService, envUserServiceFactory } from "../user/UserService.js";
import { SuspensionRepository } from "./SuspensionRepository.js";

export function suspensionServiceFactory(transaction_manager: TransactionManager) {
  const db = transaction_manager.getDB();
  const suspension_repo = new SuspensionRepository(db);
  const user_service = envUserServiceFactory(transaction_manager);
  const suspension_service = new SuspensionService(suspension_repo, user_service);
  return suspension_service;
}

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

  async getLongestActiveSuspension(user_id: number) {
    return await this.suspension_repo.getLongestActiveSuspension({ user_id });
  }

  async purgeSessionIfActive(suspension_id: number) {
    const susp = await this.suspension_repo.getSuspensionByID(suspension_id);
    if (susp == undefined) {
      return;
    }
    const is_active = dayjs(susp.suspended_until).isAfter(dayjs());
    if (!is_active) {
      return;
    }
    await this.suspension_repo.purgeSession(susp.user_id);
  }

  async addSuspension(
    opts: { reason: string; user_id: number; suspended_until: Date },
    sender_id: number,
  ) {
    const allowed = await this.isAllowedToManage(sender_id);
    if (!allowed) {
      throw new AuthError("Anda tidak diperbolehkan untuk mengatur suspensi!");
    }

    const is_banning_admin = await this.user_service.isAdminUser(opts.user_id);

    if (is_banning_admin) {
      throw new AuthError("Anda tidak diperbolehkan untuk menangguhkan akun admin!");
    }

    const res = await this.suspension_repo.addSuspension(opts);
    if (res == undefined) {
      throw new Error("Gagal memasukkan data penangguhan!");
    }

    await this.purgeSessionIfActive(res.id);
    return res;
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
    const res = await this.suspension_repo.updateSuspension(suspension_id, opts);

    await this.purgeSessionIfActive(suspension_id);

    return res;
  }

  async getSuspension(
    opts: {
      user_id?: number;
      expired_before?: Date;
      expired_after?: Date;
    },
    sender_id: number | "system",
  ) {
    let allowed = false;
    if (sender_id === "system") {
      allowed = true;
    } else {
      allowed = await this.isAllowedToManage(sender_id);
    }

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
