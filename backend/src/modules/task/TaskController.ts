import type { Express } from "express";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller.js";
import { NotFoundError } from "../../helpers/error.js";
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
      TasksDetailGet: new Route({
        handler: this.getTasksDetail,
        method: "get",
        path: "/api/tasks/:task_id",
        schema: {
          Params: z.object({
            task_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID tugas tidak valid!" }),
          }),
        },
      }),
      TasksDetailDelete: new Route({
        handler: this.deleteTasksDetail,
        method: "delete",
        path: "/api/tasks/:task_id",
        schema: {
          Params: z.object({
            task_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID tugas tidak valid!" }),
          }),
        },
      }),
      TasksDetailPut: new Route({
        handler: this.putTasksDetail,
        method: "put",
        path: "/api/tasks/:task_id",
        schema: {
          Params: z.object({
            task_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID tugas tidak valid!" }),
          }),
          ReqBody: z.object({
            bucket_id: z.number({ message: "ID kelompok tugas tidak valid!" }).optional(),
            before_id: z.number({ message: "Lokasi tugas tidak valid!" }).optional(),
            name: z
              .string({ message: "Nama tidak valid!" })
              .min(1, "Nama tidak boleh kosong!")
              .optional(),
            description: z
              .string({ message: "Deskripsi tidak valid!" })
              .min(1, "Deskripsi tidak boleh kosong!")
              .optional(),
            start_at: z
              .string({ message: "Tanggal mulai tidak valid!" })
              .date("Tanggal mulai tidak valid!")
              .optional(),
            end_at: z
              .string({ message: "Tanggal selesai tidak valid!" })
              .date("Tanggal selesai tidak valid!")
              .optional(),
          }),
        },
      }),
      BucketsDetailTasksPost: new Route({
        handler: this.postBucketsDetailTasks,
        method: "post",
        path: "/api/buckets/:bucket_id/tasks",
        schema: {
          Params: z.object({
            bucket_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID kelompok tugas tidak valid!" }),
          }),
          ReqBody: z.object({
            name: z.string({ message: "Nama tidak valid!" }).min(1, "Nama tidak boleh kosong!"),
            description: z
              .string({ message: "Deskripsi tidak valid!" })
              .min(1, "Deskripsi tidak boleh kosong!")
              .optional(),
            start_at: z
              .string({ message: "Tanggal mulai tidak valid!" })
              .date("Tanggal mulai tidak valid!")
              .optional(),
            end_at: z
              .string({ message: "Tanggal selesai tidak valid!" })
              .date("Tanggal selesai tidak valid!")
              .optional(),
          }),
        },
      }),
      BucketsDetailTasksGet: new Route({
        handler: this.getBucketsDetailTasks,
        method: "get",
        path: "/api/buckets/:bucket_id/tasks",
        schema: {
          Params: z.object({
            bucket_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID kelompok tugas tidak valid!" }),
          }),
        },
      }),
      ProjectsDetailBucketsGet: new Route({
        handler: this.getProjectsDetailBuckets,
        method: "get",
        path: "/api/projects/:project_id/buckets",
        schema: {
          Params: z.object({
            project_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID projek tidak valid!" }),
          }),
        },
      }),
      ProjectsDetailBucketsPost: new Route({
        handler: this.postProjectsDetailBuckets,
        method: "post",
        path: "/api/projects/:project_id/buckets",
        schema: {
          ReqBody: z.object({
            name: z.string({ message: "Nama invalid!" }).min(1, "Nama tidak boleh kosong!"),
          }),
          Params: z.object({
            project_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID projek tidak valid!" }),
          }),
        },
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
      end_at?: string;
      start_at?: string;
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

  private getProjectsDetailBuckets: RH<{
    Params: {
      project_id: string;
    };
    ResBody: {
      name: string;
      id: number;
    }[];
  }> = async (req, res) => {
    const { project_id } = req.params;

    const result = await this.task_service.getBuckets(Number(project_id));
    res.status(200).json(result);
  };

  private postProjectsDetailBuckets: RH<{
    Params: {
      project_id: string;
    };
    ReqBody: {
      name: string;
    };
    ResBody: {
      msg: string;
    };
  }> = async (req, res) => {
    const { project_id } = req.params;
    const { name } = req.body;

    await this.task_service.addBucket(Number(project_id), name);

    res.status(201).json({
      msg: "Bucket created!",
    });
  };

  private getTasksDetail: RH<{
    Params: {
      task_id: string;
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
    };
  }> = async (req, res) => {
    const { task_id: task_id_raw } = req.params;
    const task_id = Number(task_id_raw);

    const result = await this.task_service.getTaskByID(task_id);

    if (!result) {
      throw new NotFoundError("Gagal untuk menemukan tugas!");
    }

    res.status(200).json(result);
  };

  private deleteTasksDetail: RH<{
    Params: {
      task_id: string;
    };
    ResBody: {
      msg: string;
    };
  }> = async (req, res) => {
    const { task_id: task_id_raw } = req.params;
    const task_id = Number(task_id_raw);

    await this.task_service.deleteTask(task_id);

    res.status(200).json({ msg: "Tugas berhasil dihapus!" });
  };
}
