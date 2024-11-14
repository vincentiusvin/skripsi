import type { Express, RequestHandler } from "express";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller.js";
import { NotFoundError } from "../../helpers/error.js";
import { validateLogged } from "../../helpers/validate.js";
import {
  defaultError,
  zodStringReadableAsDateTime,
  zodStringReadableAsNumber,
} from "../../helpers/validators.js";
import { SuspensionService } from "./SuspensionService.js";

const SuspensionUpdateSchema = z.object({
  reason: z.string(defaultError("Alasan penangguhan tidak valid!")).min(1).optional(),
  suspended_until: zodStringReadableAsDateTime("Tanggal penangguhan tidak valid!").optional(),
  user_id: z.number(defaultError("Nomor pengguna tidak valid!")).optional(),
});

const SuspensionCreationSchema = z.object({
  reason: z.string(defaultError("Alasan penangguhan tidak valid!")).min(1),
  suspended_until: zodStringReadableAsDateTime("Tanggal penangguhan tidak valid!"),
  user_id: z.number(defaultError("Nomor pengguna tidak valid!")),
});

const SuspensionResponseSchema = z.object({
  reason: z.string(),
  suspended_until: z.date(),
  user_id: z.number(),
  created_at: z.date(),
  id: z.number(),
});

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
    method: "post",
    path: "/api/suspensions",
    schema: {
      ReqBody: SuspensionCreationSchema,
      ResBody: SuspensionResponseSchema,
    },
    priors: [validateLogged],
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
        throw new Error("Suspensi gagal dibuat!");
      }

      const created = await this.suspension_service.getSuspensionByID(created_id.id, sender_id);
      if (!created) {
        throw new Error("Suspensi gagal dibuat!");
      }

      res.status(201).json(created);
    },
  });
  SuspensionsDetailPut = new Route({
    method: "put",
    path: "/api/suspensions/:suspension_id",
    schema: {
      Params: z.object({
        suspension_id: zodStringReadableAsNumber("ID penangguhan tidak valid!"),
      }),
      ResBody: SuspensionResponseSchema,
      ReqBody: SuspensionUpdateSchema,
    },
    priors: [validateLogged as RequestHandler],
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
        throw new Error("Suspensi gagal dibuat!");
      }
      res.status(200).json(created);
    },
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
      ResBody: z.object({
        msg: z.string(),
      }),
      Params: z.object({
        suspension_id: zodStringReadableAsNumber("ID penangguhan tidak valid!"),
      }),
    },
    priors: [validateLogged as RequestHandler],
  });
  SuspensionsDetailGet = new Route({
    method: "get",
    path: "/api/suspensions/:suspension_id",
    schema: {
      ResBody: SuspensionResponseSchema,
      Params: z.object({
        suspension_id: zodStringReadableAsNumber("ID penangguhan tidak valid!"),
      }),
    },
    priors: [validateLogged as RequestHandler],
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
  });
  SuspensionsGet = new Route({
    method: "get",
    path: "/api/suspensions",
    priors: [validateLogged as RequestHandler],
    schema: {
      ResBody: SuspensionResponseSchema.array(),
      ReqQuery: z.object({
        user_id: zodStringReadableAsNumber("ID pengguna tidak valid!").optional(),
        expired_after: zodStringReadableAsDateTime("Tanggal mulai tidak valid!").optional(),
        expired_before: zodStringReadableAsDateTime("Tanggal akhir tidak valid!").optional(),
      }),
    },
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
  });
}
