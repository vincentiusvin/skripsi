import { AuthError, NotFoundError } from "../../helpers/error.js";
import { ProjectService } from "../project/ProjectService.js";
import { TaskRepository } from "./TaskRepository.js";

export class TaskService {
  private task_repo: TaskRepository;
  private project_service: ProjectService;

  constructor(repo: TaskRepository, project_service: ProjectService) {
    this.task_repo = repo;
    this.project_service = project_service;
  }

  async getTaskByID(task_id: number) {
    return this.task_repo.getTaskByID(task_id);
  }

  async getProjectIdFromTask(task_id: number) {
    const task = await this.task_repo.getTaskByID(task_id);
    if (task == undefined) {
      return undefined;
    }
    const bucket = await this.task_repo.getBucketByID(task.bucket_id);
    if (bucket == undefined) {
      return undefined;
    }
    return bucket.project_id;
  }

  async deleteTask(task_id: number, sender_id: number) {
    const project_id = await this.getProjectIdFromTask(task_id);
    if (project_id == undefined) {
      throw new Error("Gagal menemukan tugas tersebut!");
    }
    const sender_role = await this.project_service.getMemberRole(project_id, sender_id);
    if (sender_role !== "Admin" && sender_role !== "Dev") {
      throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
    }
    return await this.task_repo.deleteTask(task_id);
  }

  async getBucketByID(bucket_id: number) {
    return this.task_repo.getBucketByID(bucket_id);
  }

  async updateBucket(bucket_id: number, data: { name?: string }, sender_id: number) {
    const bucket = await this.getBucketByID(bucket_id);
    if (!bucket) {
      throw new Error("Gagal menemukan kelompok tugas tersebut!");
    }
    const sender_role = await this.project_service.getMemberRole(bucket.project_id, sender_id);
    if (sender_role !== "Admin" && sender_role !== "Dev") {
      throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
    }
    return this.task_repo.updateBucket(bucket_id, data);
  }

  async deleteBucket(bucket_id: number) {
    return this.task_repo.deleteBucket(bucket_id);
  }

  async updateTask(
    task_id: number,
    data: {
      bucket_id?: number;
      before_id?: number; // sisipin tasknya sebelum id ini.
      name?: string;
      description?: string;
      users?: number[];
      start_at?: string;
      end_at?: string;
    },
    sender_id: number,
  ) {
    const { users, bucket_id, name, description, start_at, end_at, before_id } = data;
    const project_id = await this.getProjectIdFromTask(task_id);
    if (project_id == undefined) {
      throw new Error("Gagal menemukan tugas tersebut!");
    }
    const sender_role = await this.project_service.getMemberRole(project_id, sender_id);
    if (sender_role !== "Admin" && sender_role !== "Dev") {
      throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
    }

    let target_bucket: number;
    const old_data = await this.task_repo.getTaskByID(task_id);
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
      const insert_before_this = await this.task_repo.getTaskByID(before_id);
      if (!insert_before_this) {
        throw new Error("Gagal mengurutkan pekerjaan!");
      }
      updateOrder = insert_before_this.order;
      await this.task_repo.bumpOrderBiggerThan(target_bucket, updateOrder);
    } else {
      const data_after = await this.task_repo.getMaxOrder(target_bucket);
      if (data_after == undefined) {
        updateOrder = 1;
      } else {
        updateOrder = data_after + 1;
      }
    }

    await this.task_repo.editTask(task_id, {
      bucket_id,
      description,
      end_at,
      users,
      name,
      order: updateOrder,
      start_at,
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
    const { bucket_id } = data;

    const bucket = await this.getBucketByID(bucket_id);
    if (!bucket) {
      throw new Error("Gagal menemukan kelompok tugas tersebut!");
    }
    const sender_role = await this.project_service.getMemberRole(bucket.project_id, sender_id);
    if (sender_role !== "Admin" && sender_role !== "Dev") {
      throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
    }

    const order = await this.task_repo.getMaxOrder(bucket_id);

    return await this.task_repo.addTask({
      ...data,
      order: order ?? 1,
    });
  }

  async getTasks(opts: { bucket_id?: number; user_id?: number }) {
    return this.task_repo.getTasks(opts);
  }

  getBuckets(opts: { project_id?: number }) {
    return this.task_repo.getBuckets(opts);
  }

  async addBucket(project_id: number, name: string, sender_id: number) {
    const sender_role = await this.project_service.getMemberRole(project_id, sender_id);
    if (sender_role !== "Admin" && sender_role !== "Dev") {
      throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
    }

    return await this.task_repo.addBucket(project_id, name);
  }
}
