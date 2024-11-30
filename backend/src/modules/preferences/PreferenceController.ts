import type { Express } from "express";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller.js";
import { validateLogged } from "../../helpers/validate.js";
import { zodStringReadableAsNumber } from "../../helpers/validators.js";
import { PreferenceService } from "./PreferenceService.js";

export class PreferenceController extends Controller {
  private preference_service: PreferenceService;
  constructor(express_server: Express, preference_service: PreferenceService) {
    super(express_server);
    this.preference_service = preference_service;
  }

  init() {
    return {
      PreferencesGet: this.PreferencesGet,
      PreferencesPut: this.PreferencesPut,
    };
  }

  PreferencesPut = new Route({
    method: "put",
    path: "/api/users/:user_id/preferences",
    priors: [validateLogged],
    schema: {
      ReqBody: z.object({
        project_invite: z.enum(["on", "off"]).optional(),
        friend_invite: z.enum(["on", "off"]).optional(),
        project_notif: z.enum(["off", "on", "email"]).optional(),
        org_notif: z.enum(["off", "on", "email"]).optional(),
        msg_notif: z.enum(["off", "on", "email"]).optional(),
        report_notif: z.enum(["off", "on", "email"]).optional(),
        task_notif: z.enum(["off", "on", "email"]).optional(),
        contrib_notif: z.enum(["off", "on", "email"]).optional(),
        friend_notif: z.enum(["off", "on", "email"]).optional(),
      }),
      Params: z.object({
        user_id: zodStringReadableAsNumber("ID pengguna tidak valid!"),
      }),
      ResBody: z.object({
        project_invite: z.enum(["on", "off"]),
        friend_invite: z.enum(["on", "off"]),
        project_notif: z.enum(["off", "on", "email"]),
        org_notif: z.enum(["off", "on", "email"]),
        msg_notif: z.enum(["off", "on", "email"]),
        report_notif: z.enum(["off", "on", "email"]),
        task_notif: z.enum(["off", "on", "email"]),
        contrib_notif: z.enum(["off", "on", "email"]),
        friend_notif: z.enum(["off", "on", "email"]),
      }),
    },
    handler: async (req, res) => {
      const {
        contrib_notif,
        friend_invite,
        friend_notif,
        msg_notif,
        org_notif,
        project_invite,
        project_notif,
        report_notif,
        task_notif,
      } = req.body;
      const { user_id: user_id_raw } = req.params;
      const user_id = Number(user_id_raw);

      await this.preference_service.saveUserPreference(user_id, {
        contrib_notif,
        friend_invite,
        friend_notif,
        msg_notif,
        org_notif,
        project_invite,
        project_notif,
        report_notif,
        task_notif,
      });

      const data = await this.preference_service.getUserPreference(user_id);
      res.status(200).json(data);
    },
  });

  PreferencesGet = new Route({
    method: "get",
    path: "/api/users/:user_id/preferences",
    priors: [validateLogged],
    schema: {
      Params: z.object({
        user_id: zodStringReadableAsNumber("ID pengguna tidak valid!"),
      }),
      ResBody: z.object({
        project_invite: z.enum(["on", "off"]),
        friend_invite: z.enum(["on", "off"]),
        project_notif: z.enum(["off", "on", "email"]),
        org_notif: z.enum(["off", "on", "email"]),
        msg_notif: z.enum(["off", "on", "email"]),
        report_notif: z.enum(["off", "on", "email"]),
        task_notif: z.enum(["off", "on", "email"]),
        contrib_notif: z.enum(["off", "on", "email"]),
        friend_notif: z.enum(["off", "on", "email"]),
      }),
    },
    handler: async (req, res) => {
      const { user_id: user_id_raw } = req.params;
      const user_id = Number(user_id_raw);

      const data = await this.preference_service.getUserPreference(user_id);
      res.status(200).json(data);
    },
  });
}
