import type { Express } from "express";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller.js";
import { RH } from "../../helpers/types.js";
import { UserService } from "./UserService.js";

export class UserController extends Controller {
  private user_service: UserService;
  constructor(express_server: Express, user_service: UserService) {
    super(express_server);
    this.user_service = user_service;
  }

  init() {
    return {
      UsersPost: new Route({
        handler: this.postUser,
        method: "post",
        path: "/api/users",
        schema: {
          ReqBody: z.object({
            user_name: z.string().min(1, "Username tidak boleh kosong!"),
            user_password: z.string().min(1, "Password tidak boleh kosong!"),
          }),
        },
      }),

      UsersGet: new Route({
        handler: this.getUsers,
        method: "get",
        path: "/api/users",
      }),

      UsersDetailGet: new Route({
        handler: this.getUserDetail,
        method: "get",
        path: "/api/users/:id",
        schema: {
          Params: z.object({
            id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID pengguna tidak valid" }),
          }),
        },
      }),

      UsersDetailPut: new Route({
        handler: this.updateUserAccount,
        method: "put",
        path: "/api/users/:id",
        schema: {
          Params: z.object({
            id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID pengguna tidak valid!" }),
          }),
          ReqBody: z.object({
            user_name: z.string().min(1, "Nama tidak boleh kosong!").optional(),
            user_password: z.string().min(1, "Password tidak boleh kosong!").optional(),
            user_education_level: z.string().min(1, "Pendidikan tidak boleh kosong!").optional(),
            user_school: z.string().min(1, "Sekolah tidak boleh kosong!").optional(),
            user_about_me: z.string().min(1, "Biodata tidak boleh kosong!").optional(),
            user_image: z.string().min(1, "Gambar tidak boleh kosong!").optional(),
          }),
        },
      }),
    };
  }

  private postUser: RH<{
    ResBody: { user_id: number; user_name: string };
    ReqBody: { user_name: string; user_password: string };
  }> = async (req, res) => {
    const { user_name, user_password } = req.body;

    const user_id = await this.user_service.addUser(user_name, user_password);
    if (user_id == undefined) {
      throw new Error("Gagal menambahkan pengguna!");
    }

    const result = await this.user_service.getUserDetail(user_id.id);
    if (result == undefined) {
      throw new Error("Gagal menambahkan pengguna!");
    }

    res.status(201).json(result);
  };

  private getUsers: RH<{
    ResBody: {
      user_id: number;
      user_name: string;
      user_email: string | null;
      user_education_level: string | null;
      user_school: string | null;
      user_about_me: string | null;
      user_image: string | null;
    }[];
  }> = async (req, res) => {
    const result = await this.user_service.getUsers();
    res.status(200).json(result);
  };

  private getUserDetail: RH<{
    Params: { id: string };
    ResBody: {
      user_id: number;
      user_name: string;
      user_email: string | null;
      user_education_level: string | null;
      user_school: string | null;
      user_about_me: string | null;
      user_image: string | null;
    };
  }> = async (req, res) => {
    const id = Number(req.params.id);
    const result = await this.user_service.getUserDetail(id);
    res.status(200).json(result);
  };

  private updateUserAccount: RH<{
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
    const user_id = Number(req.params.id);

    await this.user_service.updateAccountDetail(user_id, {
      user_name,
      user_email,
      user_education_level,
      user_school,
      user_about_me,
      user_image,
      user_password,
    });
    const updated = await this.user_service.getUserDetail(user_id);
    res.status(200).json(updated);
  };
}
