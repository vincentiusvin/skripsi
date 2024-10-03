import type { Express, RequestHandler } from "express";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller.js";
import { NotFoundError } from "../../helpers/error.js";
import { validateLogged } from "../../helpers/validate.js";
import { SuspensionService } from "./SuspensionService.js";

export class SuspensionController extends Controller {
  private suspension_service: SuspensionService;
  constructor(express_server: Express, suspension_service: SuspensionService) {
    super(express_server);
    this.suspension_service = suspension_service;
  }

  override init() {
    return {
      SuspensionsPost: this.SuspensionsPost,
      SuspensionsDetailPut: this.SuspensionsDetailPut,
      SuspensionsDetailDelete: this.SuspensionsDetailDelete,
      SuspensionsDetailGet: this.SuspensionsDetailGet,
      SuspensionsGet: this.SuspensionsGet,
    };
  }

  SuspensionsPost = new Route({
    handler: async (req, res) => {
      const { reason, suspended_until, user_id } = req.body;
      const sender_id = req.session.user_id!;

      const created_id = await this.suspension_service.addSuspension(
        {
          reason,
          suspended_until: new Date(suspended_until),
          user_id,
        },
        sender_id,
      );

      if (!created_id) {
        throw new Error("Organisasi gagal dibuat!");
      }

      const created = await this.suspension_service.getSuspensionByID(created_id.id, sender_id);
      if (!created) {
        throw new Error("Organisasi gagal dibuat!");
      }
      res.status(201).json(created);
    },
    method: "post",
    path: "/api/suspensions",
    schema: {
      ReqBody: z.object({
        reason: z
          .string({ message: "Alasan invalid!" })
          .min(1, { message: "Alasan tidak boleh kosong!" }),
        suspended_until: z
          .string({ message: "Tanggal tidak valid!" })
          .datetime("Tanggal tidak valid!"),
        user_id: z.number({ message: "Pengguna tidak valid!" }),
      }),
    },
    priors: [validateLogged as RequestHandler],
  });
  SuspensionsDetailPut = new Route({
    handler: async (req, res) => {
      const { reason, suspended_until, user_id } = req.body;
      const { suspension_id: suspension_id_raw } = req.params;
      const suspension_id = Number(suspension_id_raw);
      const sender_id = req.session.user_id!;

      await this.suspension_service.updateSuspension(
        suspension_id,
        {
          reason,
          suspended_until: suspended_until != undefined ? new Date(suspended_until) : undefined,
          user_id,
        },
        sender_id,
      );

      const created = await this.suspension_service.getSuspensionByID(suspension_id, sender_id);
      if (!created) {
        throw new Error("Organisasi gagal dibuat!");
      }
      res.status(200).json(created);
    },
    method: "put",
    path: "/api/suspensions/:suspension_id",
    schema: {
      Params: z.object({
        suspension_id: z
          .string()
          .min(1)
          .refine((arg) => !isNaN(Number(arg)), { message: "ID penangguhan tidak valid!" }),
      }),
      ReqBody: z.object({
        reason: z
          .string({ message: "Alasan invalid!" })
          .min(1, { message: "Alasan tidak boleh kosong!" })
          .optional(),
        suspended_until: z
          .string({ message: "Tanggal tidak valid!" })
          .datetime("Tanggal tidak valid!")
          .optional(),
        user_id: z.number({ message: "Pengguna tidak valid!" }).optional(),
      }),
    },
    priors: [validateLogged as RequestHandler],
  });
  SuspensionsDetailDelete = new Route({
    handler: async (req, res) => {
      const sender_id = Number(req.session.user_id);
      const { suspension_id: suspension_id_raw } = req.params;
      const suspension_id = Number(suspension_id_raw);
      await this.suspension_service.deleteSuspension(suspension_id, sender_id);
      res.status(200).json({
        msg: "Penangguhan berhasil dihapus!",
      });
    },
    method: "delete",
    path: "/api/suspensions/:suspension_id",
    schema: {
      Params: z.object({
        suspension_id: z
          .string()
          .min(1)
          .refine((arg) => !isNaN(Number(arg)), { message: "ID penangguhan tidak valid!" }),
      }),
    },
    priors: [validateLogged as RequestHandler],
  });
  SuspensionsDetailGet = new Route({
    handler: async (req, res) => {
      const sender_id = Number(req.session.user_id);
      const { suspension_id: suspension_id_raw } = req.params;
      const suspension_id = Number(suspension_id_raw);
      const result = await this.suspension_service.getSuspensionByID(suspension_id, sender_id);
      if (result == undefined) {
        throw new NotFoundError("Penangguhan yang dicari tidak dapat ditemukan!");
      }
      res.status(200).json(result);
    },
    method: "get",
    path: "/api/suspensions/:suspension_id",
    schema: {
      Params: z.object({
        suspension_id: z
          .string()
          .min(1)
          .refine((arg) => !isNaN(Number(arg)), { message: "ID penangguhan tidak valid!" }),
      }),
    },
    priors: [validateLogged as RequestHandler],
  });
  SuspensionsGet = new Route({
    handler: async (req, res) => {
      const sender_id = Number(req.session.user_id);
      const { user_id, expired_after, expired_before } = req.query;
      const result = await this.suspension_service.getSuspension(
        {
          user_id: user_id != undefined ? Number(user_id) : undefined,
          expired_after: expired_after != undefined ? new Date(expired_after) : undefined,
          expired_before: expired_before != undefined ? new Date(expired_before) : undefined,
        },
        sender_id,
      );
      res.status(200).json(result);
    },
    method: "get",
    path: "/api/suspensions",
    priors: [validateLogged as RequestHandler],
    schema: {
      ReqQuery: z.object({
        user_id: z
          .string()
          .min(1)
          .refine((arg) => !isNaN(Number(arg)), { message: "ID pengguna tidak valid!" })
          .optional(),
        expired_after: z
          .string({ message: "Tanggal mulai tidak valid!" })
          .datetime("Tanggal mulai tidak valid!")
          .optional(),
        expired_before: z
          .string({ message: "Tanggal akhir tidak valid!" })
          .datetime("Tanggal akhir tidak valid!")
          .optional(),
      }),
    },
  });
}
