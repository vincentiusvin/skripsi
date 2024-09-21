import type { Express } from "express";
import { RequestHandler } from "express";
import { Controller, Route } from "../../helpers/controller.js";
import { RH } from "../../helpers/types.js";
import { validateLogged } from "../../helpers/validate.js";
import { NotificationTypes } from "./NotificationMisc.js";
import { NotificationService } from "./NotificationService.js";

export class NotificationController extends Controller {
  private notifcation_service: NotificationService;
  constructor(express_server: Express, notification_service: NotificationService) {
    super(express_server);
    this.notifcation_service = notification_service;
  }

  override init() {
    return {
      NotificationsGet: new Route({
        handler: this.getNotifications,
        method: "get",
        path: "/api/notifications",
        priors: [validateLogged as RequestHandler],
      }),
      NotificationsPut: new Route({
        handler: this.putNotifications,
        method: "put",
        path: "/api/notifications/:notification_id",
        priors: [validateLogged as RequestHandler],
      }),
    };
  }

  private getNotifications: RH<{
    ReqQuery: {
      user_id?: string;
      read?: "true" | "false";
    };
    ResBody: {
      user_id: number;
      read: boolean;
      title: string;
      created_at: Date;
      description: string;
      type: NotificationTypes;
      type_id: number | null;
      id: number;
    }[];
  }> = async (req, res) => {
    const { user_id, read } = req.query;

    const result = await this.notifcation_service.getNotifications({
      user_id: user_id != undefined ? Number(user_id) : undefined,
      read: read != undefined ? read === "true" : undefined,
    });

    res.status(200).json(result);
  };

  private putNotifications: RH<{
    ReqBody: {
      read: boolean;
    };
    Params: {
      notification_id: string;
    };
    ResBody: {
      user_id: number;
      read: boolean;
      title: string;
      created_at: Date;
      description: string;
      type: NotificationTypes;
      type_id: number | null;
      id: number;
    };
  }> = async (req, res) => {
    const { notification_id: notification_id_str } = req.params;
    const notification_id = Number(notification_id_str);
    const { read } = req.body;

    await this.notifcation_service.updateNotification(notification_id, read);
    const result = await this.notifcation_service.getNotification(notification_id);

    res.status(200).json(result);
  };
}
