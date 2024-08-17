import type { Express } from "express";
import { z } from "zod";
import { Controller, Route } from "../../../../helpers/controller";
import { RH } from "../../../../helpers/types.js";
import { UserAccountService } from "./UserAccountSevice";

export class UserAccountController extends Controller {
  private user_service: UserAccountService;
  constructor(express_server: Express, userService: UserAccountService) {
    super(express_server);
    this.user_service = userService;
  }
  init() {
    return {
      //[GET] /api/user/account/:id"
      UserAccountGet: new Route({
        handler: this.getUserAccount,
        method: "get",
        path: "/api/user/account/:id",
        schema: {
          Params: z.object({
            id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID tidak valid" }),
          }),
        },
      }),

      //[PUT] /api/user/account/:id"
      UserAccountUpdate: new Route({
        handler: this.updateUserAccount,
        method: "put",
        path: "/api/user/account/:id",
        schema: {
          Params: z.object({
            id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID Tidak valid!" }),
          }),
          ReqBody: z.object({
            user_name: z.string().min(1).optional(),
            user_password: z.string().min(1).optional(),
            user_education_level: z.string().min(1).optional(),
            user_school: z.string().min(1).optional(),
            user_about_me: z.string().min(1).optional(),
            user_image: z.string().min(1).optional(),
          }),
        },
      }),
    };
  }

  getUserAccount: RH<{
    Params: { id: string };
    ResBody: {
      user_id: number;
      user_name: string;
      user_password: string;
      user_email: string | null;
      user_education_level: string | null;
      user_school: string | null;
      user_about_me: string | null;
      user_image: string | null;
    };
  }> = async (req, res) => {
    const id = Number(req.params.id);
    const result = await this.user_service.getUserAccountDetail(id);
    res.status(200).json(result);
  };

  updateUserAccount: RH<{
    ResBody: {
      user_id: number;
      user_name: string;
      user_email: string | null;
      user_education_level: string | null;
      user_school: string | null;
      user_about_me: string | null;
      user_image: string | null;
    };
    Params: {
      id: string;
    };
    ReqBody: {
      user_name?: string;
      user_password?: string;
      user_email?: string;
      user_education_level?: string;
      user_school?: string;
      user_about_me?: string;
      user_image?: string;
    };
  }> = async (req, res) => {
    const {
      user_name,
      user_password,
      user_email,
      user_education_level,
      user_school,
      user_about_me,
      user_image,
    } = req.body;
    const id = req.params.id;
    await this.user_service.updateAccountDetail(Number(id), {
      user_name,
      user_email,
      user_education_level,
      user_school,
      user_about_me,
      user_image,
      user_password,
    });
    const updated = await this.user_service.getUserAccountDetail(Number(id));
    res.status(200).json(updated);
  };
}
