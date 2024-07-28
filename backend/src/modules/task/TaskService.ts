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

    if (bucket_id) {
      target_bucket = bucket_id;
    } else {
      const old_data = await this.repo.findTaskByID(task_id);
      if (old_data == undefined) {
        throw new NotFoundError("Gagal menemukan pekerjaan tersebut!");
      }
      target_bucket = old_data.bucket_id;
    }

    let updateOrder: number;
    if (before_id != undefined) {
      const insert_before_this = await this.repo.findTaskByID(before_id);
      if (!insert_before_this) {
        throw new Error("Gagal mengurutkan pekerjaan!");
      }
      updateOrder = insert_before_this.order;
    } else {
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
    end_at?: Date;
    start_at?: Date;
  }) {
    const { bucket_id } = data;
    const order = await this.repo.getMaxOrder(bucket_id);
    if (!order) {
      throw new NotFoundError("Kelompok tugas gagal untuk ditemukan!");
    }

    return await this.repo.addTask({
      ...data,
      order,
    });
  }

  async getTaskByBucket(bucket_id: number) {
    return this.repo.findTasksByBucket(bucket_id);
  }
}
