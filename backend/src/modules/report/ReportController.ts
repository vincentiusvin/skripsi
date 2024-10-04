import type { Express } from "express";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller.js";
import { zodStringReadableAsNumber } from "../../helpers/validators.js";
import { report_status } from "./ReportMisc.js";
import { ReportService } from "./ReportService.js";

export class ReportController extends Controller {
  private report_service: ReportService;
  constructor(express_server: Express, report_service: ReportService) {
    super(express_server);
    this.report_service = report_service;
  }

  init() {
    return {
      ReportsGet: this.ReportsGet,
      ReportsDetailGet: this.ReportsDetailGet,
      ReportsPost: this.ReportsPost,
      ReportsDetailPut: this.ReportsDetailPut,
    };
  }

  ReportsGet = new Route({
    method: "get",
    path: "/api/reports",
    schema: {
      ReqQuery: z.object({
        user_id: zodStringReadableAsNumber("Pengguna tidak valid!").optional(),
      }),
      ResBody: z
        .object({
          status: z.enum(report_status),
          id: z.number(),
          sender_id: z.number(),
          title: z.string(),
          description: z.string(),
          created_at: z.date(),
          resolved_at: z.date().nullable(),
          resolution: z.string().nullable(),
          chatroom_id: z.number().nullable(),
        })
        .array(),
    },
    handler: async (req, res) => {
      const sender_id = Number(req.session.user_id!);
      const { user_id: user_id_str } = req.query;
      const result = await this.report_service.getReports(
        { user_id: user_id_str != undefined ? Number(user_id_str) : undefined },
        sender_id,
      );

      res.status(200).json(result);
    },
  });
  ReportsDetailGet = new Route({
    method: "get",
    path: "/api/reports/:report_id",
    schema: {
      Params: z.object({
        report_id: zodStringReadableAsNumber("ID laporan invalid!"),
      }),
      ResBody: z.object({
        status: z.enum(report_status),
        id: z.number(),
        sender_id: z.number(),
        title: z.string(),
        description: z.string(),
        created_at: z.date(),
        resolved_at: z.date().nullable(),
        resolution: z.string().nullable(),
        chatroom_id: z.number().nullable(),
      }),
    },
    handler: async (req, res) => {
      const sender_id = Number(req.session.user_id!);
      const report_id = Number(req.params.report_id);

      const result = await this.report_service.getReportByID(report_id, sender_id);

      res.status(200).json(result);
    },
  });
  ReportsPost = new Route({
    method: "post",
    path: "/api/reports",
    schema: {
      ResBody: z.object({
        status: z.enum(report_status),
        id: z.number(),
        sender_id: z.number(),
        title: z.string(),
        description: z.string(),
        created_at: z.date(),
        resolved_at: z.date().nullable(),
        resolution: z.string().nullable(),
        chatroom_id: z.number().nullable(),
      }),
      ReqBody: z.object({
        title: z
          .string({
            message: "Judul tidak valid!",
          })
          .min(1, {
            message: "Judul tidak boleh kosong!",
          }),
        description: z
          .string({
            message: "Deskripsi tidak valid!",
          })
          .min(1, {
            message: "Deskripsi tidak boleh kosong!",
          }),
      }),
    },
    handler: async (req, res) => {
      const sender_id = Number(req.session.user_id!);
      const { title, description } = req.body;

      const report_id = await this.report_service.createReport({
        title,
        description,
        sender_id,
      });

      if (!report_id) {
        throw new Error("Gagal memasukkan data!");
      }

      const result = await this.report_service.getReportByID(report_id.id, sender_id);
      res.status(201).json(result);
    },
  });
  ReportsDetailPut = new Route({
    schema: {
      Params: z.object({
        report_id: zodStringReadableAsNumber("ID tidak valid!"),
      }),
      ReqBody: z.object({
        title: z
          .string({
            message: "Judul tidak valid!",
          })
          .min(1, {
            message: "Judul tidak boleh kosong!",
          })
          .optional(),
        description: z
          .string({
            message: "Deskripsi tidak valid!",
          })
          .min(1, {
            message: "Deskripsi tidak boleh kosong!",
          })
          .optional(),
        status: z.enum(report_status).optional(),
        resolution: z
          .string({
            message: "Catatan tidak valid!",
          })
          .min(1, {
            message: "Catatan tidak boleh kosong!",
          })
          .optional(),
        chatroom: z.boolean().optional(),
      }),
      ResBody: z.object({
        status: z.enum(report_status),
        id: z.number(),
        sender_id: z.number(),
        title: z.string(),
        description: z.string(),
        created_at: z.date(),
        resolved_at: z.date().nullable(),
        resolution: z.string().nullable(),
        chatroom_id: z.number().nullable(),
      }),
    },
    method: "put",
    path: "/api/reports/:report_id",
    handler: async (req, res) => {
      const sender_id = Number(req.session.user_id!);
      const report_id = Number(req.params.report_id);
      const { title, description, status, resolution, chatroom } = req.body;

      await this.report_service.updateReport(
        report_id,
        {
          title,
          description,
          status,
          resolution,
          chatroom,
        },
        sender_id,
      );

      const result = await this.report_service.getReportByID(report_id, sender_id);
      res.status(200).json(result);
    },
  });
}
