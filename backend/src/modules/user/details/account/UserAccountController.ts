import { z } from "zod";
import { Application } from "../../../../app.js";
import { Controller, Route } from "../../../../helpers/controller";
import { RH } from "../../../../helpers/types.js";
import { UserAccountRepository } from "./UserAccountRepository";
import { UserAccountService } from "./UserAccountSevice";

export class UserAccountController extends Controller {
  private user_service: UserAccountService;
  constructor(app: Application) {
    super(app);
    this.user_service = new UserAccountService(new UserAccountRepository(app.db));
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
        },
      }),
    };
  }

  getUserAccount: RH<{
    Params: { id: string };
    ResBody: {
      user_id: number;
      user_name: string;
      user_email: string | null;
      user_education_level: string | null;
      user_school: string | null;
      user_about_me: string | null;
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
      user_password: string;
      user_email: string | null;
      user_education_level: string | null;
      user_school: string | null;
      user_about_me: string | null;
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
    };
  }> = async (req, res) => {
    const {
      user_name,
      user_password,
      user_email,
      user_education_level,
      user_school,
      user_about_me,
    } = req.body;
    const id = req.params.id;
    await this.user_service.updateAccountDetail(Number(id), {
      user_name,
      user_password,
      user_email,
      user_education_level,
      user_school,
      user_about_me,
    });
    const updated = await this.user_service.getUserAccountDetail(Number(id));
    res.status(200).json(updated);
  };
}
