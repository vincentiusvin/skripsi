import dayjs from "dayjs";
import { AuthError, ClientError, NotFoundError } from "../../helpers/error.js";
import { Transactable, TransactionManager } from "../../helpers/transaction/transaction.js";
import {
  NotificationService,
  envNotificationServiceFactory,
} from "../notification/NotificationService.js";
import { ProjectService, projectServiceFactory } from "../project/ProjectService.js";
import { TaskRepository } from "./TaskRepository.js";

export function taskServiceFactory(transaction_manager: TransactionManager) {
  const db = transaction_manager.getDB();
  const task_repo = new TaskRepository(db);
  const notification_service = envNotificationServiceFactory(transaction_manager);
  const project_service = projectServiceFactory(transaction_manager);
  const task_service = new TaskService(
    task_repo,
    project_service,
    notification_service,
    transaction_manager,
  );
  return task_service;
}

export class TaskService implements Transactable<TaskService> {
  factory = taskServiceFactory;

  private task_repo: TaskRepository;
  private project_service: ProjectService;
  private notification_service: NotificationService;
  private transaction_manager: TransactionManager;

  constructor(
    repo: TaskRepository,
    project_service: ProjectService,
    notification_service: NotificationService,
    transaction_manager: TransactionManager,
  ) {
    this.task_repo = repo;
    this.project_service = project_service;
    this.notification_service = notification_service;
    this.transaction_manager = transaction_manager;
  }

  async getTaskByID(task_id: number) {
    return this.task_repo.getTaskByID(task_id);
  }

  async getProjectIdFromTask(task_id: number) {
    return await this.transaction_manager.transaction(this as TaskService, async (serv) => {
      const task = await serv.task_repo.getTaskByID(task_id);
      if (task == undefined) {
        return undefined;
      }
      const bucket = await serv.task_repo.getBucketByID(task.bucket_id);
      if (bucket == undefined) {
        return undefined;
      }
      return bucket.project_id;
    });
  }

  async deleteTask(task_id: number, sender_id: number) {
    return await this.transaction_manager.transaction(this as TaskService, async (serv) => {
      const project_id = await serv.getProjectIdFromTask(task_id);
      if (project_id == undefined) {
        throw new Error("Gagal menemukan tugas tersebut!");
      }
      const sender_role = await serv.project_service.getMemberRole(project_id, sender_id);
      if (sender_role !== "Admin" && sender_role !== "Dev") {
        throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
      }
      return await serv.task_repo.deleteTask(task_id);
    });
  }

  async getBucketByID(bucket_id: number) {
    return this.task_repo.getBucketByID(bucket_id);
  }

  async updateBucket(bucket_id: number, data: { name?: string }, sender_id: number) {
    return await this.transaction_manager.transaction(this as TaskService, async (serv) => {
      const bucket = await serv.getBucketByID(bucket_id);
      if (!bucket) {
        throw new Error("Gagal menemukan kelompok tugas tersebut!");
      }
      const sender_role = await serv.project_service.getMemberRole(bucket.project_id, sender_id);
      if (sender_role !== "Admin" && sender_role !== "Dev") {
        throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
      }
      return serv.task_repo.updateBucket(bucket_id, data);
    });
  }

  async deleteBucket(bucket_id: number) {
    return this.task_repo.deleteBucket(bucket_id);
  }

  async updateTask(
    task_id: number,
    data: {
      bucket_id?: number;
      before_id?: number | null; // sisipin tasknya sebelum id ini.
      name?: string;
      description?: string | null;
      users?: number[];
      start_at?: string | null;
      end_at?: string | null;
    },
    sender_id: number,
  ) {
    const { users, bucket_id, name, description, start_at, end_at, before_id } = data;
    let project_id;
    await this.transaction_manager.transaction(this as TaskService, async (serv) => {
      project_id = await serv.getProjectIdFromTask(task_id);
      if (project_id == undefined) {
        throw new Error("Gagal menemukan tugas tersebut!");
      }

      const sender_role = await serv.project_service.getMemberRole(project_id, sender_id);
      if (sender_role !== "Admin" && sender_role !== "Dev") {
        throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
      }

      let target_bucket: number;
      const old_data = await serv.task_repo.getTaskByID(task_id);
      if (old_data == undefined) {
        throw new NotFoundError("Gagal menemukan pekerjaan tersebut!");
      }

      if (bucket_id) {
        target_bucket = bucket_id;
      } else {
        target_bucket = old_data.bucket_id;
      }

      let updateOrder: number | undefined;
      if (before_id != undefined) {
        const insert_before_this = await serv.task_repo.getTaskByID(before_id);
        if (!insert_before_this) {
          throw new Error("Gagal mengurutkan pekerjaan!");
        }
        updateOrder = insert_before_this.order;
        await serv.task_repo.bumpOrderBiggerThan(target_bucket, updateOrder);
      } else if (before_id === null || target_bucket != old_data.bucket_id) {
        const data_after = await serv.task_repo.getMaxOrder(target_bucket);
        if (data_after == undefined) {
          updateOrder = 1;
        } else {
          updateOrder = data_after + 1;
        }
      }

      const end_at_or_old = data.end_at ?? old_data.end_at;
      const start_at_or_old = data.start_at ?? old_data.start_at;

      if (end_at_or_old != undefined && start_at_or_old != undefined) {
        const end_dayjs = dayjs(end_at_or_old);
        const start_dayjs = dayjs(start_at_or_old);
        if (end_dayjs.isBefore(start_dayjs)) {
          throw new ClientError("Tanggal mulai harus sebelum tanggal selesai!");
        }
      }

      await serv.task_repo.editTask(task_id, {
        bucket_id,
        description,
        end_at,
        users,
        name,
        order: updateOrder,
        start_at,
      });
    });
    if (users != undefined && project_id != undefined) {
      for (const user_id of users) {
        await this.sendTaskNotification(task_id, project_id, user_id);
      }
    }
  }

  async addDefaultConfig(project_id: number, sender_id: number) {
    return await this.transaction_manager.transaction(this as TaskService, async (serv) => {
      const buckets = await serv.getBuckets({
        project_id,
      });

      if (buckets.length !== 0) {
        throw new ClientError("Anda tidak dapat me-reset kanban board apabila masih ada tugas!");
      }

      const sender_role = await serv.project_service.getMemberRole(project_id, sender_id);
      if (sender_role !== "Admin" && sender_role !== "Dev") {
        throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
      }

      const id = await serv.addBucket(project_id, "Backlog", sender_id);
      await serv.addBucket(project_id, "Doing", sender_id);
      await serv.addBucket(project_id, "Done", sender_id);

      if (id == undefined) {
        throw new Error("Gagal membuat kelompok tugas pada proyek!");
      }
      await serv.addTask(
        {
          bucket_id: id.id,
          name: "Contoh tugas",
          description: "Anda dapat menarik tugas ini ke kelompok lain",
        },
        sender_id,
      );
    });
  }

  async addTask(
    data: {
      bucket_id: number;
      name: string;
      description?: string;
      users?: number[];
      end_at?: string;
      start_at?: string;
    },
    sender_id: number,
  ) {
    return await this.transaction_manager.transaction(this as TaskService, async (serv) => {
      const { bucket_id } = data;

      const bucket = await serv.getBucketByID(bucket_id);
      if (!bucket) {
        throw new Error("Gagal menemukan kelompok tugas tersebut!");
      }
      const sender_role = await serv.project_service.getMemberRole(bucket.project_id, sender_id);
      if (sender_role !== "Admin" && sender_role !== "Dev") {
        throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
      }

      const { end_at, start_at } = data;

      if (end_at !== undefined && start_at !== undefined) {
        const end_dayjs = dayjs(end_at);
        const start_dayjs = dayjs(start_at);
        if (end_dayjs.isBefore(start_dayjs)) {
          throw new ClientError("Tanggal mulai harus sebelum tanggal selesai!");
        }
      }

      const order = await serv.task_repo.getMaxOrder(bucket_id);

      const result = await serv.task_repo.addTask({
        ...data,
        order: order ?? 1,
      });

      await serv.addTaskEvent(bucket.project_id, result.id);
      return result;
    });
  }

  async getTasks(opts: { bucket_id?: number; user_id?: number }) {
    return this.task_repo.getTasks(opts);
  }

  getBuckets(opts: { project_id?: number }) {
    return this.task_repo.getBuckets(opts);
  }

  async addBucket(project_id: number, name: string, sender_id: number) {
    return await this.transaction_manager.transaction(this as TaskService, async (serv) => {
      const sender_role = await serv.project_service.getMemberRole(project_id, sender_id);
      if (sender_role !== "Admin" && sender_role !== "Dev") {
        throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
      }

      return await serv.task_repo.addBucket(project_id, name);
    });
  }

  private async addTaskEvent(project_id: number, task_id: number) {
    const task = await this.getTaskByID(task_id);
    if (!task) {
      throw new Error(`Gagal menemukan tugas ${task_id}`);
    }
    for (const { user_id } of task.users) {
      await this.sendTaskNotification(task_id, project_id, user_id);
    }
    await this.project_service.addEvent(project_id, `Ditambahkan tugas baru "${task.name}"`);
  }

  private async sendTaskNotification(task_id: number, project_id: number, user_id: number) {
    const task = await this.getTaskByID(task_id);
    if (!task) {
      return;
    }
    return this.notification_service.addNotification({
      title: `Tugas "${task.name}"`,
      user_id,
      description: `Anda tercatat sebagai pelaksana tugas "${task.name}"`,
      type: "Tugas",
      type_id: project_id,
    });
  }
}
