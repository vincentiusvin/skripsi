import type { Express } from "express";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller.js";
import { NotFoundError } from "../../helpers/error.js";
import {
  zodStringReadableAsDateTime,
  zodStringReadableAsNumber,
} from "../../helpers/validators.js";
import { TaskService } from "./TaskService.js";

export class TaskController extends Controller {
  private task_service: TaskService;
  constructor(express_server: Express, task_service: TaskService) {
    super(express_server);
    this.task_service = task_service;
  }

  init() {
    return {
      TasksDetailGet: this.TasksDetailGet,
      TasksDetailDelete: this.TasksDetailDelete,
      TasksDetailPut: this.TasksDetailPut,
      BucketsDetailGet: this.BucketsDetailGet,
      BucketsDetailPut: this.BucketsDetailPut,
      BucketsDetailDelete: this.BucketsDetailDelete,
      TasksPost: this.TasksPost,
      TasksGet: this.TasksGet,
      BucketsGet: this.BucketsGet,
      BucketsPost: this.BucketsPost,
    };
  }

  TasksDetailGet = new Route({
    method: "get",
    path: "/api/tasks/:task_id",
    schema: {
      Params: z.object({
        task_id: zodStringReadableAsNumber("ID tugas tidak valid!"),
      }),
      ResBody: z.object({
        bucket_id: z.number(),
        name: z.string(),
        description: z.string().nullable(),
        start_at: z.date().nullable(),
        end_at: z.date().nullable(),
        id: z.number(),
        order: z.number(),
        users: z.array(
          z.object({
            user_id: z.number(),
          }),
        ),
      }),
    },
    handler: async (req, res) => {
      const { task_id: task_id_raw } = req.params;
      const task_id = Number(task_id_raw);

      const result = await this.task_service.getTaskByID(task_id);

      if (!result) {
        throw new NotFoundError("Gagal untuk menemukan tugas!");
      }

      res.status(200).json(result);
    },
  });
  TasksDetailDelete = new Route({
    method: "delete",
    path: "/api/tasks/:task_id",
    schema: {
      Params: z.object({
        task_id: zodStringReadableAsNumber("ID tugas tidak valid!"),
      }),
      ResBody: z.object({
        msg: z.string(),
      }),
    },
    handler: async (req, res) => {
      const { task_id: task_id_raw } = req.params;
      const task_id = Number(task_id_raw);
      const sender_id = Number(req.session.user_id);

      await this.task_service.deleteTask(task_id, sender_id);

      res.status(200).json({ msg: "Tugas berhasil dihapus!" });
    },
  });
  TasksDetailPut = new Route({
    method: "put",
    path: "/api/tasks/:task_id",
    schema: {
      Params: z.object({
        task_id: zodStringReadableAsNumber("ID tugas tidak valid!"),
      }),
      ReqBody: z.object({
        bucket_id: z.number({ message: "ID kelompok tugas tidak valid!" }).optional(),
        before_id: z.number({ message: "Lokasi tugas tidak valid!" }).optional().nullable(),
        users: z.array(z.number(), { message: "Pengguna invalid!" }).optional(),
        name: z
          .string({ message: "Nama tidak valid!" })
          .min(1, "Nama tidak boleh kosong!")
          .optional(),
        description: z
          .string({ message: "Deskripsi tidak valid!" })
          .min(1, "Deskripsi tidak boleh kosong!")
          .optional(),
        start_at: zodStringReadableAsDateTime("Tanggal mulai tidak valid!").optional().nullable(),
        end_at: zodStringReadableAsDateTime("Tanggal selesai tidak valid!").optional().nullable(),
      }),
      ResBody: z.object({
        bucket_id: z.number(),
        name: z.string(),
        description: z.string().nullable(),
        start_at: z.date().nullable(),
        end_at: z.date().nullable(),
        id: z.number(),
        order: z.number(),
        users: z.array(
          z.object({
            user_id: z.number(),
          }),
        ),
      }),
    },
    handler: async (req, res) => {
      const { task_id: task_id_raw } = req.params;
      const { users, bucket_id, name, description, start_at, end_at, before_id } = req.body;
      const sender_id = Number(req.session.user_id);

      const task_id = Number(task_id_raw);
      await this.task_service.updateTask(
        task_id,
        {
          before_id,
          bucket_id,
          description,
          end_at,
          name,
          users,
          start_at,
        },
        sender_id,
      );

      const result = await this.task_service.getTaskByID(task_id);

      if (!result) {
        throw new Error("Gagal untuk menemukan tugas setelah melakukan update!");
      }

      res.status(200).json(result);
    },
  });
  BucketsDetailGet = new Route({
    path: "/api/buckets/:bucket_id",
    method: "get",
    schema: {
      ResBody: z.object({
        name: z.string(),
        id: z.number(),
        project_id: z.number(),
      }),
      Params: z.object({
        bucket_id: zodStringReadableAsNumber("ID kelompok tugas tidak valid!"),
      }),
    },
    handler: async (req, res) => {
      const { bucket_id: bucket_id_raw } = req.params;
      const bucket_id = Number(bucket_id_raw);

      const result = await this.task_service.getBucketByID(bucket_id);

      if (!result) {
        throw new NotFoundError("Gagal untuk menemukan kelompok tugas!");
      }

      res.status(200).json(result);
    },
  });
  BucketsDetailPut = new Route({
    path: "/api/buckets/:bucket_id",
    method: "put",
    schema: {
      ResBody: z.object({
        name: z.string(),
        id: z.number(),
        project_id: z.number(),
      }),
      Params: z.object({
        bucket_id: zodStringReadableAsNumber("ID kelompok tugas tidak valid!"),
      }),
      ReqBody: z.object({
        name: z
          .string({ message: "Nama kelompok tugas tidak valid!" })
          .min(1, "Nama kelompok tugas tidak boleh kosong")
          .optional(),
      }),
    },
    handler: async (req, res) => {
      const { bucket_id: bucket_id_raw } = req.params;
      const { name } = req.body;
      const bucket_id = Number(bucket_id_raw);
      const sender_id = Number(req.session.user_id);

      await this.task_service.updateBucket(
        bucket_id,
        {
          name,
        },
        sender_id,
      );

      const result = await this.task_service.getBucketByID(bucket_id);

      if (!result) {
        throw new NotFoundError("Gagal untuk menemukan kelompok tugas!");
      }

      res.status(200).json(result);
    },
  });
  BucketsDetailDelete = new Route({
    path: "/api/buckets/:bucket_id",
    method: "delete",
    schema: {
      ResBody: z.object({
        msg: z.string(),
      }),
      Params: z.object({
        bucket_id: zodStringReadableAsNumber("ID kelompok tugas tidak valid!"),
      }),
    },
    handler: async (req, res) => {
      const { bucket_id: bucket_id_raw } = req.params;
      const bucket_id = Number(bucket_id_raw);

      await this.task_service.deleteBucket(bucket_id);

      res.status(200).json({ msg: "Kelompok tugas berhsail dihapus!" });
    },
  });
  TasksPost = new Route({
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
        start_at: zodStringReadableAsDateTime("Tanggal mulai tidak valid!").optional(),
        end_at: zodStringReadableAsDateTime("Tanggal selesai tidak valid!").optional(),
      }),
      ResBody: z.object({
        bucket_id: z.number(),
        name: z.string(),
        description: z.string().nullable(),
        start_at: z.date().nullable(),
        end_at: z.date().nullable(),
        id: z.number(),
        order: z.number(),
        users: z.array(
          z.object({
            user_id: z.number(),
          }),
        ),
      }),
    },
    handler: async (req, res) => {
      const { bucket_id, users, name, description, end_at, start_at } = req.body;
      const sender_id = Number(req.session.user_id);

      const task_id = await this.task_service.addTask(
        {
          bucket_id,
          name,
          users,
          description,
          end_at,
          start_at,
        },
        sender_id,
      );

      if (!task_id) {
        throw new Error("Gagal menemukan task setelah ditambahkan!");
      }
      const result = await this.task_service.getTaskByID(task_id.id);
      if (!result) {
        throw new Error("Gagal menemukan task setelah ditambahkan!");
      }

      res.status(201).json(result);
    },
  });
  TasksGet = new Route({
    method: "get",
    path: "/api/tasks",
    schema: {
      ResBody: z
        .object({
          bucket_id: z.number(),
          name: z.string(),
          description: z.string().nullable(),
          start_at: z.date().nullable(),
          end_at: z.date().nullable(),
          id: z.number(),
          order: z.number(),
          users: z.array(
            z.object({
              user_id: z.number(),
            }),
          ),
        })
        .array(),
      ReqQuery: z.object({
        bucket_id: zodStringReadableAsNumber("ID kelompok tugas tidak valid!").optional(),
        user_id: zodStringReadableAsNumber("ID pengguna tidak valid!").optional(),
      }),
    },
    handler: async (req, res) => {
      const { bucket_id, user_id } = req.query;
      const result = await this.task_service.getTasks({
        bucket_id: bucket_id != undefined ? Number(bucket_id) : undefined,
        user_id: user_id != undefined ? Number(user_id) : undefined,
      });
      res.status(200).json(result);
    },
  });
  BucketsGet = new Route({
    method: "get",
    path: "/api/buckets",
    schema: {
      ResBody: z
        .object({
          name: z.string(),
          id: z.number(),
          project_id: z.number(),
        })
        .array(),
      ReqQuery: z.object({
        project_id: zodStringReadableAsNumber("ID projek tidak valid!").optional(),
      }),
    },
    handler: async (req, res) => {
      const { project_id } = req.query;

      const result = await this.task_service.getBuckets({
        project_id: project_id != undefined ? Number(project_id) : undefined,
      });
      res.status(200).json(result);
    },
  });
  BucketsPost = new Route({
    method: "post",
    path: "/api/buckets",
    schema: {
      ReqBody: z.object({
        name: z.string({ message: "Nama invalid!" }).min(1, "Nama tidak boleh kosong!"),
        project_id: z.number({ message: "ID projek tidak boleh kosong!" }),
      }),
      Params: z.object({}),
      ResBody: z.object({
        msg: z.string(),
      }),
    },
    handler: async (req, res) => {
      const { name, project_id } = req.body;
      const sender_id = Number(req.session.user_id);

      await this.task_service.addBucket(project_id, name, sender_id);

      res.status(201).json({
        msg: "Bucket created!",
      });
    },
  });
}
