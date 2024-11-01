import type { Express } from "express";
import { RequestHandler } from "express";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller.js";
import { validateLogged } from "../../helpers/validate.js";
import { defaultError, zodStringReadableAsNumber } from "../../helpers/validators.js";
import { notification_types } from "./NotificationMisc.js";
import { NotificationService } from "./NotificationService.js";

const NotificationResponseSchema = z.object({
  type: z.enum(notification_types),
  read: z.boolean(),
  user_id: z.number(),
  id: z.number(),
  description: z.string(),
  title: z.string(),
  created_at: z.date(),
  type_id: z.number().nullable(),
});

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
        user_id: zodStringReadableAsNumber("Nomor pengguna tidak valid!").optional(),
        read: z.string(defaultError("Status baca tidak valid!")).optional(),
      }),
      ResBody: NotificationResponseSchema.array(),
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
        notification_id: z.string(defaultError("Nomor notifikasi tidak valid!")),
      }),
      ReqBody: z.object({
        read: z.boolean(),
      }),
      ResBody: NotificationResponseSchema,
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
