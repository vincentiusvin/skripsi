import type { Express } from "express";
import { Controller, Route } from "../../helpers/controller.js";
import { RH } from "../../helpers/types.js";
import { TaskService } from "./TaskService.js";

export class TaskController extends Controller {
  private task_service: TaskService;
  constructor(express_server: Express, task_service: TaskService) {
    super(express_server);
    this.task_service = task_service;
  }

  init() {
    return {
      TasksDetailPut: new Route({
        handler: this.putTasksDetail,
        method: "put",
        path: "/api/tasks/:task_id",
      }),
      BucketsDetailTasksPost: new Route({
        handler: this.postBucketsDetailTasks,
        method: "post",
        path: "/api/buckets/:bucket_id/tasks",
      }),
      BucketsDetailTasksGet: new Route({
        handler: this.getBucketsDetailTasks,
        method: "get",
        path: "/api/buckets/:bucket_id/tasks",
      }),
    };
  }

  private putTasksDetail: RH<{
    Params: {
      task_id: string;
    };
    ReqBody: {
      bucket_id?: number;
      before_id?: number;
      name?: string;
      description?: string;
      start_at?: string;
      end_at?: string;
    };
    ResBody: {
      id: number;
      name: string;
      description: string | null;
      end_at: Date | null;
      start_at: Date | null;
      bucket_id: number;
      order: number;
      users: {
        user_id: number;
      }[];
    };
  }> = async (req, res) => {
    const { task_id: task_id_raw } = req.params;
    const { bucket_id, name, description, start_at, end_at, before_id } = req.body;

    const task_id = Number(task_id_raw);
    await this.task_service.updateTask(task_id, {
      before_id,
      bucket_id,
      description,
      end_at,
      name,
      start_at,
    });

    const result = await this.task_service.getTaskByID(task_id);

    if (!result) {
      throw new Error("Gagal untuk menemukan tugas setelah melakukan update!");
    }

    res.status(200).json(result);
  };

  private postBucketsDetailTasks: RH<{
    Params: {
      bucket_id: string;
    };
    ResBody: {
      id: number;
      name: string;
      description: string | null;
      end_at: Date | null;
      start_at: Date | null;
      bucket_id: number;
      order: number;
      users: {
        user_id: number;
      }[];
    };
    ReqBody: {
      name: string;
      description?: string;
      end_at?: Date;
      start_at?: Date;
    };
  }> = async (req, res) => {
    const { bucket_id } = req.params;
    const { name, description, end_at, start_at } = req.body;

    const task_id = await this.task_service.addTask({
      bucket_id: Number(bucket_id),
      name,
      description,
      end_at,
      start_at,
    });

    if (!task_id) {
      throw new Error("Gagal menemukan task setelah ditambahkan!");
    }
    const result = await this.task_service.getTaskByID(task_id.id);
    if (!result) {
      throw new Error("Gagal menemukan task setelah ditambahkan!");
    }

    res.status(201).json(result);
  };

  private getBucketsDetailTasks: RH<{
    Params: {
      bucket_id: string;
    };
    ResBody: {
      id: number;
      name: string;
      description: string | null;
      end_at: Date | null;
      start_at: Date | null;
      users: {
        user_id: number;
      }[];
    }[];
  }> = async (req, res) => {
    const { bucket_id } = req.params;
    const result = await this.task_service.getTaskByBucket(Number(bucket_id));
    res.status(200).json(result);
  };
}
