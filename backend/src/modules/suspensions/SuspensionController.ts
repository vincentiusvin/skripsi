import type { Express, RequestHandler } from "express";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller.js";
import { NotFoundError } from "../../helpers/error.js";
import { RH } from "../../helpers/types.js";
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
      SuspensionsPost: new Route({
        handler: this.postSuspension,
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
      }),
      SuspensionsDetailPut: new Route({
        handler: this.putSuspensionDetail,
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
      }),
      SuspensionsDetailDelete: new Route({
        handler: this.deleteSuspension,
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
      }),
      SuspensionsDetailGet: new Route({
        handler: this.getSuspensionsDetail,
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
      }),
      SuspensionsGet: new Route({
        handler: this.getSuspensions,
        method: "get",
        path: "/api/suspensions",
        priors: [validateLogged as RequestHandler],
      }),
    };
  }

  deleteSuspension: RH<{
    Params: {
      suspension_id: string;
    };
    ResBody: {
      msg: string;
    };
  }> = async (req, res) => {
    const sender_id = Number(req.session.user_id);
    const { suspension_id: suspension_id_raw } = req.params;
    const suspension_id = Number(suspension_id_raw);
    await this.suspension_service.deleteSuspension(suspension_id, sender_id);
    res.status(200).json({
      msg: "Penangguhan berhasil dihapus!",
    });
  };

  getSuspensionsDetail: RH<{
    ResBody: {
      id: number;
      reason: string;
      suspended_until: Date;
      user_id: number;
    };
    Params: {
      suspension_id: string;
    };
  }> = async (req, res) => {
    const sender_id = Number(req.session.user_id);
    const { suspension_id: suspension_id_raw } = req.params;
    const suspension_id = Number(suspension_id_raw);
    const result = await this.suspension_service.getSuspensionByID(suspension_id, sender_id);
    if (result == undefined) {
      throw new NotFoundError("Penangguhan yang dicari tidak dapat ditemukan!");
    }
    res.status(200).json(result);
  };

  getSuspensions: RH<{
    ResBody: {
      id: number;
      reason: string;
      suspended_until: Date;
      user_id: number;
    }[];
  }> = async (req, res) => {
    const sender_id = Number(req.session.user_id);
    const result = await this.suspension_service.getSuspension(sender_id);
    res.status(200).json(result);
  };

  postSuspension: RH<{
    ResBody: {
      id: number;
      reason: string;
      suspended_until: Date;
      user_id: number;
    };
    ReqBody: {
      reason: string;
      suspended_until: string;
      user_id: number;
    };
  }> = async (req, res) => {
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
  };

  putSuspensionDetail: RH<{
    ResBody: {
      id: number;
      reason: string;
      suspended_until: Date;
      user_id: number;
    };
    ReqBody: {
      reason?: string;
      suspended_until?: string;
      user_id?: number;
    };
    Params: {
      suspension_id: string;
    };
  }> = async (req, res) => {
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
  };
}
