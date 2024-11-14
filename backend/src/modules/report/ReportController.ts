import type { Express } from "express";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller.js";
import {
  defaultError,
  zodPagination,
  zodStringReadableAsNumber,
} from "../../helpers/validators.js";
import { report_status } from "./ReportMisc.js";
import { ReportService } from "./ReportService.js";

const ReportUpdateSchema = z.object({
  title: z.string(defaultError("Judul laporan tidak valid!")).min(1).optional(),
  description: z.string(defaultError("Deskripsi laporan tidak valid!")).min(1).optional(),
  status: z.enum(report_status, defaultError("Status laporan tidak valid!")).optional(),
  resolution: z.string(defaultError("Resolusi laporan tidak valid!")).min(1).optional(),
  chatroom: z.boolean(defaultError("Nomor ruang chat tidak valid!")).optional(),
});

const ReportCreationSchema = z.object({
  title: z.string(defaultError("Judul laporan tidak valid!")).min(1),
  description: z.string(defaultError("Deskripsi laporan tidak valid!")).min(1),
});

const ReportResponseSchema = z.object({
  status: z.enum(report_status),
  id: z.number(),
  sender_id: z.number(),
  title: z.string(),
  description: z.string(),
  created_at: z.date(),
  resolved_at: z.date().nullable(),
  resolution: z.string().nullable(),
  chatroom_id: z.number().nullable(),
});

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
        status: z.enum(report_status, defaultError("Status laporan tidak valid!")).optional(),
        ...zodPagination(),
      }),
      ResBody: z.object({
        result: ReportResponseSchema.array(),
        total: z.number(),
      }),
    },
    handler: async (req, res) => {
      const sender_id = Number(req.session.user_id!);
      const { page, limit, user_id: user_id_str } = req.query;
      const filter = {
        user_id: user_id_str != undefined ? Number(user_id_str) : undefined,
        limit: limit != undefined ? Number(limit) : undefined,
        page: limit != undefined ? Number(page) : undefined,
      };

      const result = await this.report_service.getReports(filter, sender_id);
      const count = await this.report_service.countReports(filter, sender_id);

      res.status(200).json({ result, total: Number(count.count) });
    },
  });
  ReportsDetailGet = new Route({
    method: "get",
    path: "/api/reports/:report_id",
    schema: {
      Params: z.object({
        report_id: zodStringReadableAsNumber("ID laporan invalid!"),
      }),
      ResBody: ReportResponseSchema,
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
      ResBody: ReportResponseSchema,
      ReqBody: ReportCreationSchema,
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
      ReqBody: ReportUpdateSchema,
      ResBody: ReportResponseSchema,
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
