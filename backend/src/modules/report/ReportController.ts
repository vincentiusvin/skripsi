import type { Express } from "express";
import { ZodType, z } from "zod";
import { Controller, Route } from "../../helpers/controller.js";
import { RH } from "../../helpers/types.js";
import { ReportStatus, parseReportStatus } from "./ReportMisc.js";
import { ReportService } from "./ReportService.js";

export class ReportController extends Controller {
  private report_service: ReportService;
  constructor(express_server: Express, report_service: ReportService) {
    super(express_server);
    this.report_service = report_service;
  }

  init() {
    return {
      ReportsGet: new Route({
        handler: this.getReports,
        method: "get",
        path: "/api/reports",
      }),
      ReportsDetailGet: new Route({
        handler: this.getReportsDetail,
        method: "get",
        path: "/api/reports/:report_id",
      }),
      ReportsPost: new Route({
        handler: this.postReports,
        schema: {
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
            status: z
              .string({
                message: "Status tidak valid!",
              })
              .min(1, {
                message: "Status tidak boleh kosong!",
              })
              .transform((arg) => parseReportStatus(arg)) as ZodType<ReportStatus>,
            resolution: z
              .string({
                message: "Resolusi tidak valid!",
              })
              .min(1, {
                message: "Resolusi tidak boleh kosong!",
              })
              .optional(),
            resolved_at: z
              .string({ message: "Tanggal resolusi tidak valid!" })
              .datetime("Tanggal resolusi tidak valid!")
              .optional(),
            chatroom_id: z
              .number({
                message: "ID ruangan tidak valid!",
              })
              .optional(),
          }),
        },
        method: "post",
        path: "/api/reports",
      }),
      ReportsDetailPut: new Route({
        handler: this.putReportDetail,
        schema: {
          Params: z.object({
            report_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID tidak valid!" }),
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
            status: z
              .string({
                message: "Status tidak valid!",
              })
              .min(1, {
                message: "Status tidak boleh kosong!",
              })
              .transform((arg) => parseReportStatus(arg))
              .optional() as ZodType<ReportStatus>,
            resolution: z
              .string({
                message: "Resolusi tidak valid!",
              })
              .min(1, {
                message: "Resolusi tidak boleh kosong!",
              })
              .optional(),
            resolved_at: z
              .string({ message: "Tanggal resolusi tidak valid!" })
              .datetime("Tanggal resolusi tidak valid!")
              .optional(),
            chatroom_id: z
              .number({
                message: "ID ruangan tidak valid!",
              })
              .optional(),
          }),
        },
        method: "put",
        path: "/api/reports/:report_id",
      }),
    };
  }

  private getReports: RH<{
    ResBody: {
      id: number;
      sender_id: number;
      title: string;
      description: string;
      status: ReportStatus;
      created_at: Date;
      resolved_at: Date | null;
      resolution: string | null;
    }[];
    ReqQuery: {
      user_id?: string;
    };
  }> = async (req, res) => {
    const sender_id = Number(req.session.user_id!);
    const { user_id: user_id_str } = req.query;
    const result = await this.report_service.getReports(
      { user_id: user_id_str != undefined ? Number(user_id_str) : undefined },
      sender_id,
    );

    res.status(200).json(result);
  };

  private getReportsDetail: RH<{
    ResBody: {
      id: number;
      sender_id: number;
      title: string;
      description: string;
      status: ReportStatus;
      created_at: Date;
      resolved_at: Date | null;
      resolution: string | null;
    };
    Params: {
      report_id: string;
    };
  }> = async (req, res) => {
    const sender_id = Number(req.session.user_id!);
    const report_id = Number(req.params.report_id);

    const result = await this.report_service.getReportByID(report_id, sender_id);

    res.status(200).json(result);
  };

  private postReports: RH<{
    ResBody: {
      id: number;
      sender_id: number;
      title: string;
      description: string;
      status: ReportStatus;
      created_at: Date;
      resolved_at: Date | null;
      resolution: string | null;
    };
    ReqBody: {
      title: string;
      description: string;
      status: ReportStatus;
      resolution?: string;
      resolved_at?: string;
      chatroom_id?: number;
    };
  }> = async (req, res) => {
    const sender_id = Number(req.session.user_id!);
    const { title, description, status, resolution, resolved_at, chatroom_id } = req.body;

    const report_id = await this.report_service.addReport({
      title,
      description,
      status,
      resolution,
      resolved_at: resolved_at != undefined ? new Date(resolved_at) : undefined,
      chatroom_id,
      sender_id,
    });

    if (!report_id) {
      throw new Error("Gagal memasukkan data!");
    }

    const result = await this.report_service.getReportByID(report_id.id, sender_id);
    res.status(201).json(result);
  };

  private putReportDetail: RH<{
    ResBody: {
      id: number;
      sender_id: number;
      title: string;
      description: string;
      status: ReportStatus;
      created_at: Date;
      resolved_at: Date | null;
      resolution: string | null;
    };
    ReqBody: {
      title?: string;
      description?: string;
      status?: ReportStatus;
      resolution?: string;
      resolved_at?: string;
      chatroom_id?: number;
    };
    Params: {
      report_id: string;
    };
  }> = async (req, res) => {
    const sender_id = Number(req.session.user_id!);
    const report_id = Number(req.params.report_id);
    const { title, description, status, resolution, resolved_at, chatroom_id } = req.body;

    await this.report_service.updateReport(
      report_id,
      {
        title,
        description,
        status,
        resolution,
        resolved_at: resolved_at != undefined ? new Date(resolved_at) : undefined,
        chatroom_id,
        sender_id,
      },
      sender_id,
    );

    const result = await this.report_service.getReportByID(report_id, sender_id);
    res.status(200).json(result);
  };
}
