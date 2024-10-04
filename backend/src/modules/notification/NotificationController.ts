import type { Express } from "express";
import { RequestHandler } from "express";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller.js";
import { validateLogged } from "../../helpers/validate.js";
import { zodStringReadableAsNumber } from "../../helpers/validators.js";
import { NotificationService } from "./NotificationService.js";

export class NotificationController extends Controller {
  private notifcation_service: NotificationService;
  constructor(express_server: Express, notification_service: NotificationService) {
    super(express_server);
    this.notifcation_service = notification_service;
  }

  override init() {
    return {
      NotificationsGet: this.NotificationsGet,
      NotificationsPut: this.NotificationsPut,
    };
  }

  NotificationsGet = new Route({
    method: "get",
    path: "/api/notifications",
    priors: [validateLogged as RequestHandler],
    schema: {
      ReqQuery: z.object({
        user_id: zodStringReadableAsNumber("Pengguna tidak ditemukan!").optional(),
        read: z.string().optional(),
      }),
      ResBody: z
        .object({
          type: z.enum(["OrgManage", "ProjectManage", "ProjectTask", "ProjectChat", "GeneralChat"]),
          read: z.boolean(),
          user_id: z.number(),
          id: z.number(),
          description: z.string(),
          title: z.string(),
          created_at: z.date(),
          type_id: z.number().nullable(),
        })
        .array(),
    },
    handler: async (req, res) => {
      const { user_id, read } = req.query;

      const result = await this.notifcation_service.getNotifications({
        user_id: user_id != undefined ? Number(user_id) : undefined,
        read: read != undefined ? read === "true" : undefined,
      });

      res.status(200).json(result);
    },
  });

  NotificationsPut = new Route({
    method: "put",
    path: "/api/notifications/:notification_id",
    priors: [validateLogged],
    schema: {
      Params: z.object({
        notification_id: z.string(),
      }),
      ReqBody: z.object({
        read: z.boolean(),
      }),
      ResBody: z.object({
        type: z.enum(["OrgManage", "ProjectManage", "ProjectTask", "ProjectChat", "GeneralChat"]),
        read: z.boolean(),
        user_id: z.number(),
        id: z.number(),
        description: z.string(),
        title: z.string(),
        created_at: z.date(),
        type_id: z.number().nullable(),
      }),
    },
    handler: async (req, res) => {
      const { notification_id: notification_id_str } = req.params;
      const notification_id = Number(notification_id_str);
      const { read } = req.body;
      const sender_id = Number(req.session.user_id);

      await this.notifcation_service.updateNotification(notification_id, read, sender_id);
      const result = await this.notifcation_service.getNotification(notification_id);
      res.status(200).json(result);
    },
  });
}
