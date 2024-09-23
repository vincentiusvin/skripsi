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
            users: z.array(z.number(), { message: "Pengguna invalid!" }).optional(),
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
              .datetime("Tanggal mulai tidak valid!")
              .optional(),
            end_at: z
              .string({ message: "Tanggal selesai tidak valid!" })
              .datetime("Tanggal selesai tidak valid!")
              .optional(),
          }),
        },
      }),
      BucketsDetailGet: new Route({
        handler: this.getBucketDetail,
        path: "/api/buckets/:bucket_id",
        method: "get",
        schema: {
          Params: z.object({
            bucket_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID kelompok tugas tidak valid!" }),
          }),
        },
      }),
      BucketsDetailPut: new Route({
        handler: this.putBucketDetail,
        path: "/api/buckets/:bucket_id",
        method: "put",
        schema: {
          Params: z.object({
            bucket_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID kelompok tugas tidak valid!" }),
          }),
          ReqBody: z.object({
            name: z
              .string({ message: "Nama kelompok tugas tidak valid!" })
              .min(1, "Nama kelompok tugas tidak boleh kosong")
              .optional(),
          }),
        },
      }),
      BucketsDetailDelete: new Route({
        handler: this.deleteBucketDetail,
        path: "/api/buckets/:bucket_id",
        method: "delete",
        schema: {
          Params: z.object({
            bucket_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID kelompok tugas tidak valid!" }),
          }),
        },
      }),
      TasksPost: new Route({
        handler: this.postTasks,
        method: "post",
        path: "/api/tasks",
        schema: {
          ReqBody: z.object({
            name: z.string({ message: "Nama tidak valid!" }).min(1, "Nama tidak boleh kosong!"),
            bucket_id: z.number({ message: "Kelompok tugas tidak boleh kosong!" }),
            users: z.array(z.number(), { message: "Pengguna invalid!" }).optional(),
            description: z
              .string({ message: "Deskripsi tidak valid!" })
              .min(1, "Deskripsi tidak boleh kosong!")
              .optional(),
            start_at: z
              .string({ message: "Tanggal mulai tidak valid!" })
              .datetime("Tanggal mulai tidak valid!")
              .optional(),
            end_at: z
              .string({ message: "Tanggal selesai tidak valid!" })
              .datetime("Tanggal selesai tidak valid!")
              .optional(),
          }),
        },
      }),
      TasksGet: new Route({
        handler: this.getTasks,
        method: "get",
        path: "/api/tasks",
        schema: {
          ReqQuery: z.object({
            bucket_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID kelompok tugas tidak valid!" })
              .optional(),
            user_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID pengguna tidak valid!" })
              .optional(),
          }),
        },
      }),
      BucketsGet: new Route({
        handler: this.getBuckets,
        method: "get",
        path: "/api/buckets",
        schema: {
          ReqQuery: z.object({
            project_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID projek tidak valid!" })
              .optional(),
          }),
        },
      }),
      BucketsPost: new Route({
        handler: this.postBuckets,
        method: "post",
        path: "/api/buckets",
        schema: {
          ReqBody: z.object({
            name: z.string({ message: "Nama invalid!" }).min(1, "Nama tidak boleh kosong!"),
            project_id: z.number({ message: "ID projek tidak boleh kosong!" }),
          }),
          Params: z.object({}),
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
      users?: number[];
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
    const { users, bucket_id, name, description, start_at, end_at, before_id } = req.body;

    const task_id = Number(task_id_raw);
    await this.task_service.updateTask(task_id, {
      before_id,
      bucket_id,
      description,
      end_at,
      name,
      users,
      start_at,
    });

    const result = await this.task_service.getTaskByID(task_id);

    if (!result) {
      throw new Error("Gagal untuk menemukan tugas setelah melakukan update!");
    }

    res.status(200).json(result);
  };

  private postTasks: RH<{
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
      bucket_id: number;
      users?: number[];
      end_at?: string;
      start_at?: string;
    };
  }> = async (req, res) => {
    const { bucket_id, users, name, description, end_at, start_at } = req.body;

    const task_id = await this.task_service.addTask({
      bucket_id,
      name,
      users,
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

  private getTasks: RH<{
    ReqQuery: {
      bucket_id?: string;
      user_id?: string;
    };
    ResBody: {
      id: number;
      bucket_id: number;
      name: string;
      description: string | null;
      end_at: Date | null;
      start_at: Date | null;
      users: {
        user_id: number;
      }[];
    }[];
  }> = async (req, res) => {
    const { bucket_id, user_id } = req.query;
    const result = await this.task_service.getTasks({
      bucket_id: bucket_id != undefined ? Number(bucket_id) : undefined,
      user_id: user_id != undefined ? Number(user_id) : undefined,
    });
    res.status(200).json(result);
  };

  private getBuckets: RH<{
    ReqQuery: {
      project_id?: string;
    };
    ResBody: {
      name: string;
      id: number;
      project_id: number;
    }[];
  }> = async (req, res) => {
    const { project_id } = req.query;

    const result = await this.task_service.getBuckets({
      project_id: project_id != undefined ? Number(project_id) : undefined,
    });
    res.status(200).json(result);
  };

  private postBuckets: RH<{
    ReqBody: {
      name: string;
      project_id: number;
    };
    ResBody: {
      msg: string;
    };
  }> = async (req, res) => {
    const { name, project_id } = req.body;

    await this.task_service.addBucket(project_id, name);

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
      bucket_id: number;
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

  private getBucketDetail: RH<{
    Params: {
      bucket_id: string;
    };
    ResBody: {
      id: number;
      name: string;
      project_id: number;
    };
  }> = async (req, res) => {
    const { bucket_id: bucket_id_raw } = req.params;
    const bucket_id = Number(bucket_id_raw);

    const result = await this.task_service.getBucketByID(bucket_id);

    if (!result) {
      throw new NotFoundError("Gagal untuk menemukan kelompok tugas!");
    }

    res.status(200).json(result);
  };

  private putBucketDetail: RH<{
    Params: {
      bucket_id: string;
    };
    ResBody: {
      id: number;
      name: string;
      project_id: number;
    };
    ReqBody: {
      name?: string;
    };
  }> = async (req, res) => {
    const { bucket_id: bucket_id_raw } = req.params;
    const { name } = req.body;
    const bucket_id = Number(bucket_id_raw);

    await this.task_service.updateBucket(bucket_id, {
      name,
    });

    const result = await this.task_service.getBucketByID(bucket_id);

    if (!result) {
      throw new NotFoundError("Gagal untuk menemukan kelompok tugas!");
    }

    res.status(200).json(result);
  };

  private deleteBucketDetail: RH<{
    Params: {
      bucket_id: string;
    };
    ResBody: {
      msg: string;
    };
  }> = async (req, res) => {
    const { bucket_id: bucket_id_raw } = req.params;
    const bucket_id = Number(bucket_id_raw);

    await this.task_service.deleteBucket(bucket_id);

    res.status(200).json({ msg: "Kelompok tugas berhsail dihapus!" });
  };
}
