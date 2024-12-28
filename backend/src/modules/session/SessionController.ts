import dayjs from "dayjs";
import type { Express } from "express";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller.js";
import { ClientError } from "../../helpers/error.js";
import { defaultError } from "../../helpers/validators.js";
import { SuspensionService } from "../suspensions/SuspensionService.js";
import { UserService } from "../user/UserService.js";

export class SessionController extends Controller {
  private suspension_service: SuspensionService;
  private user_service: UserService;
  constructor(
    express_server: Express,
    user_service: UserService,
    suspension_service: SuspensionService,
  ) {
    super(express_server);
    this.user_service = user_service;
    this.suspension_service = suspension_service;
  }

  init() {
    return {
      SessionGet: this.SessionGet,
      SessionPut: this.SessionPut,
      SessionDelete: this.SessionDelete,
    };
  }

  SessionGet = new Route({
    method: "get",
    path: "/api/session",
    schema: {
      ResBody: z.union([
        z.object({
          user_name: z.string(),
          user_id: z.number(),
          logged: z.literal(true),
          is_admin: z.boolean(),
        }),
        z.object({
          logged: z.literal(false),
        }),
      ]),
    },
    handler: async (req, res) => {
      const userId = req.session.user_id;
      const user = userId != undefined ? await this.user_service.getUserDetail(userId) : undefined;

      if (user) {
        res.status(200).json({
          user_name: user.user_name,
          user_id: user.user_id,
          logged: true,
          is_admin: user.user_is_admin,
        });
      } else {
        res.status(200).json({
          logged: false,
        });
      }
    },
  });

  SessionPut = new Route({
    method: "put",
    path: "/api/session",
    schema: {
      ReqBody: z.object({
        user_name: z.string(defaultError("Username harus diisi!")).min(1),
        user_password: z.string(defaultError("Password harus diisi!")).min(1),
      }),
      ResBody: z.object({
        user_name: z.string(),
      }),
    },
    handler: async (req, res) => {
      const { user_password, user_name } = req.body;

      const user = await this.user_service.findUserByCredentials(user_name, user_password);
      if (user == undefined) {
        throw new ClientError("Gagal menemukan akun dengan nama dan password tersebut!");
      }

      const susp = await this.suspension_service.getLongestActiveSuspension(user.id);
      if (susp !== undefined) {
        throw new ClientError(
          `Akun anda ditangguhkan hingga ${dayjs(susp.suspended_until)
            .tz("Asia/Jakarta") // maybe can be an env someday
            .format("dddd[,] D MMM YYYY[,] HH:mm")} dengan alasan: ${susp.reason}`,
        );
      }

      req.session.user_id = user.id;
      res.status(200).json({
        user_name: user.name,
      });
    },
  });

  SessionDelete = new Route({
    method: "delete",
    path: "/api/session",
    schema: {
      ResBody: z.object({
        msg: z.string(),
      }),
    },
    handler: async (req, res) => {
      req.session.destroy(() => {
        res.status(200).json({
          msg: "Sukses keluar dari akun!",
        });
      });
    },
  });
}
