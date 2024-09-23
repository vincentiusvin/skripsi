import { NotFoundError } from "../../helpers/error.js";
import { TaskRepository } from "./TaskRepository.js";

export class TaskService {
  repo: TaskRepository;
  constructor(repo: TaskRepository) {
    this.repo = repo;
  }

  async getTaskByID(task_id: number) {
    return this.repo.findTaskByID(task_id);
  }

  async deleteTask(task_id: number) {
    return this.repo.deleteTask(task_id);
  }

  async getBucketByID(bucket_id: number) {
    return this.repo.getBucketByID(bucket_id);
  }

  async updateBucket(bucket_id: number, data: { name?: string }) {
    return this.repo.updateBucket(bucket_id, data);
  }

  async deleteBucket(bucket_id: number) {
    return this.repo.deleteBucket(bucket_id);
  }

  async updateTask(
    task_id: number,
    data: {
      bucket_id?: number;
      before_id?: number; // sisipin tasknya sebelum id ini.
      name?: string;
      description?: string;
      start_at?: string;
      end_at?: string;
    },
  ) {
    const { bucket_id, name, description, start_at, end_at, before_id } = data;

    let target_bucket: number;
    const old_data = await this.repo.findTaskByID(task_id);
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
      const insert_before_this = await this.repo.findTaskByID(before_id);
      if (!insert_before_this) {
        throw new Error("Gagal mengurutkan pekerjaan!");
      }
      updateOrder = insert_before_this.order;
      await this.repo.bumpOrderBiggerThan(target_bucket, updateOrder);
    } else if (target_bucket != old_data.bucket_id) {
      const data_after = await this.repo.getMaxOrder(target_bucket);
      if (data_after == undefined) {
        updateOrder = 1;
      } else {
        updateOrder = data_after + 1;
      }
    }

    await this.repo.editTask(task_id, {
      bucket_id,
      description,
      end_at,
      name,
      order: updateOrder,
      start_at,
    });
  }

  async addTask(data: {
    bucket_id: number;
    name: string;
    description?: string;
    end_at?: string;
    start_at?: string;
  }) {
    const { bucket_id } = data;
    const order = await this.repo.getMaxOrder(bucket_id);

    return await this.repo.addTask({
      ...data,
      order: order ?? 1,
    });
  }

  async getTaskByBucket(opts: { bucket_id?: number }) {
    return this.repo.findTasksByBucket(opts);
  }

  getBuckets(project_id: number) {
    return this.repo.getProjectBuckets(project_id);
  }

  addBucket(project_id: number, name: string) {
    return this.repo.addBucket(project_id, name);
  }
}
