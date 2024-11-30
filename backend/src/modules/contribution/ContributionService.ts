import { AuthError, ClientError, NotFoundError } from "../../helpers/error.js";
import { Transactable, TransactionManager } from "../../helpers/transaction/transaction.js";
import {
  NotificationService,
  envNotificationServiceFactory,
} from "../notification/NotificationService.js";
import { ProjectService, projectServiceFactory } from "../project/ProjectService.js";
import { UserService, envUserServiceFactory } from "../user/UserService.js";
import { ContributionStatus } from "./ContributionMisc.js";
import { Contribution, ContributionRepository } from "./ContributionRepository";

export function contributionServiceFactory(transaction_manager: TransactionManager) {
  const db = transaction_manager.getDB();
  const contribution_repo = new ContributionRepository(db);
  const project_service = projectServiceFactory(transaction_manager);
  const notification_service = envNotificationServiceFactory(transaction_manager);
  const user_service = envUserServiceFactory(transaction_manager);

  const contribution_service = new ContributionService(
    contribution_repo,
    project_service,
    notification_service,
    user_service,
    transaction_manager,
  );
  return contribution_service;
}

// Flow status:
// pending -> approved, revision, rejected
// approved, revision -> pending (boleh balik pending kalau udah approved)
// rejected -> end

export class ContributionService implements Transactable<ContributionService> {
  private cont_repo: ContributionRepository;
  private project_service: ProjectService;
  private user_service: UserService;
  private notification_service: NotificationService;
  private transaction_manager: TransactionManager;
  constructor(
    cont_repo: ContributionRepository,
    project_service: ProjectService,
    notification_service: NotificationService,
    user_service: UserService,
    transaction_manager: TransactionManager,
  ) {
    this.cont_repo = cont_repo;
    this.project_service = project_service;
    this.notification_service = notification_service;
    this.user_service = user_service;
    this.transaction_manager = transaction_manager;
  }
  factory = contributionServiceFactory;

  async countContributions(
    params: {
      status?: ContributionStatus;
      user_id?: number;
      keyword?: string;
      project_id?: number;
    },
    sender_id?: number,
  ) {
    return await this.transaction_manager.transaction(this as ContributionService, async (serv) => {
      const allowed = await this.isAllowedToView(params, sender_id);
      if (!allowed) {
        throw new AuthError("Anda tidak memiliki akses untuk membaca kontribusi ini!");
      }

      const result = await serv.cont_repo.countContributions(params);

      return result;
    });
  }

  async getContributions(
    params: {
      status?: ContributionStatus;
      page?: number;
      limit?: number;
      user_id?: number;
      keyword?: string;
      project_id?: number;
    },
    sender_id?: number,
  ) {
    return await this.transaction_manager.transaction(this as ContributionService, async (serv) => {
      const allowed = await this.isAllowedToView(params, sender_id);
      if (!allowed) {
        throw new ClientError("Anda tidak memiliki akses untuk membaca kontribusi ini!");
      }

      const result = await serv.cont_repo.getContributions(params);

      return result;
    });
  }

  async getContributionDetail(contribution_id: number, sender_id: number) {
    return await this.transaction_manager.transaction(this as ContributionService, async (serv) => {
      const result = await serv.cont_repo.getContributionsDetail(contribution_id);
      if (result == undefined) {
        throw new NotFoundError("Gagal menemukan kontribusi tersebut!");
      }

      const allowed = await serv.isAllowedToView(
        {
          status: result.status,
          project_id: result.project_id,
          user_id: result.user_ids.find((x) => x.user_id === sender_id)?.user_id,
        },
        sender_id,
      );

      if (!allowed) {
        throw new AuthError("Anda tidak memiliki akses untuk membaca kontribusi ini!");
      }

      return result;
    });
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
    return await this.transaction_manager.transaction(this as ContributionService, async (serv) => {
      // Harus dibuat sama orang projek, tapi boleh include orang di luar.
      const is_member = await serv.project_service.getMemberRole(obj.project_id, sender_id);
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

      await serv.project_service.getProjectByID(obj.project_id);
      const res = await serv.cont_repo.addContributions({ ...obj, status: "Pending" }, users);
      await serv.sendNewContributionNotification(res.id);
      return res;
    });
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
    return await this.transaction_manager.transaction(this as ContributionService, async (serv) => {
      const old_data = await serv.getContributionDetail(id, sender_id);
      if (old_data == undefined) {
        throw new NotFoundError("Gagal menemukan kontribusi tersebut!");
      }

      const { status } = obj;
      if (status === "Approved" || status === "Rejected" || status === "Revision") {
        await serv.approveContribution(status, old_data, sender_id);
      } else {
        await serv.reviseContribution(old_data, { ...obj, status }, sender_id);
      }
    });
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
      throw new AuthError("Anda tidak memiliki akses untuk memberikan persetujuan!");
    }
    if (contrib.user_ids.map((x) => x.user_id).includes(user_id)) {
      throw new AuthError("Anda tidak boleh memberikan persetujuan untuk kontribusi anda sendiri!");
    }
    await this.cont_repo.updateContribution(contrib.id, {
      status,
    });
    await this.sendStatusUpdateNotification(contrib.id);
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
    if (old_contrib.status !== "Pending") {
      await this.sendStatusUpdateNotification(old_contrib.id);
    }
  }

  private async sendStatusUpdateNotification(contribution_id: number) {
    const contrib = await this.cont_repo.getContributionsDetail(contribution_id);
    if (!contrib) {
      return;
    }
    let message = "diubah";
    if (contrib.status === "Approved") {
      message = "Diterima";
    } else if (contrib.status === "Pending") {
      message = "Diubah Menjadi Pending";
    } else if (contrib.status === "Rejected") {
      message = "Ditolak";
    } else if (contrib.status === "Revision") {
      message = "Diminta Revisi";
    }

    await Promise.all(
      contrib.user_ids.map(async ({ user_id }) => {
        return await this.notification_service.addNotification({
          title: `Kontribusi "${contrib.name}" ${message}`,
          user_id,
          description: `Terdapat perkembangan pada laporan kontribusi "${
            contrib.name
          } yang anda buat. Kontribusi tersebut ${message.toLocaleLowerCase()}"`,
          type: "Kontribusi",
          type_id: contribution_id,
        });
      }),
    );

    if (contrib.status === "Pending") {
      const project = await this.project_service.getProjectByID(contrib.project_id);
      const admins = project?.project_members.filter((x) => x.role === "Admin") ?? [];
      await Promise.all(
        admins.map(async ({ user_id }) => {
          return await this.notification_service.addNotification({
            title: `Kontribusi "${contrib.name}" ${message}`,
            user_id,
            description: `Terdapat perkembangan pada laporan kontribusi "${contrib.name}. Anda dapat mengevaluasi ulang kontribusi tersebut."`,
            type: "Kontribusi",
            type_id: contribution_id,
          });
        }),
      );
    }
  }
  private async sendNewContributionNotification(contribution_id: number) {
    const contrib = await this.cont_repo.getContributionsDetail(contribution_id);
    if (!contrib) {
      return;
    }

    const project = await this.project_service.getProjectByID(contrib.project_id);
    if (!project) {
      throw new Error(`Gagal menemukan proyek ${contrib.project_id}`);
    }
    const admins = project.project_members.filter((x) => x.role === "Admin") ?? [];
    await Promise.all(
      admins.map(async ({ user_id }) => {
        return await this.notification_service.addNotification({
          title: `Kontribusi "${contrib.name}" membutuhkan persetujuan anda!`,
          user_id,
          description: `Pengguna menambahkan laporan kontribusi "${contrib.name} di proyek "${project.project_name}". Anda dapat mengevaluasi kontribusi tersebut."`,
          type: "Kontribusi",
          type_id: contribution_id,
        });
      }),
    );
  }

  private async isAllowedToView(
    params: {
      status?: ContributionStatus;
      user_id?: number;
      project_id?: number;
    },
    sender_id?: number,
  ) {
    const { status, user_id, project_id } = params;
    if (status === "Approved") {
      return true;
    }

    if (sender_id == undefined) {
      return;
    }

    if (sender_id == user_id) {
      return true;
    }

    if (project_id != undefined) {
      const role = await this.project_service.getMemberRole(project_id, sender_id);
      if (role === "Admin") {
        return true;
      }
    }

    const isAdmin = await this.user_service.isAdminUser(sender_id);
    if (isAdmin) {
      return true;
    }

    return false;
  }
}
