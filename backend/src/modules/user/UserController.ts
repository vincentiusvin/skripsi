import type { Express } from "express";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller.js";
import { zodStringReadableAsNumber } from "../../helpers/validators.js";
import { UserService } from "./UserService.js";

const UserResponseSchema = z.object({
  user_id: z.number(),
  user_name: z.string(),
  user_email: z.string(),
  user_education_level: z.string().nullable(),
  user_school: z.string().nullable(),
  user_about_me: z.string().nullable(),
  user_image: z.string().nullable(),
  user_website: z.string().nullable(),
  user_is_admin: z.boolean(),
  user_created_at: z.date(),
  user_socials: z
    .object({
      social: z.string(),
    })
    .array(),
});

export class UserController extends Controller {
  private user_service: UserService;
  constructor(express_server: Express, user_service: UserService) {
    super(express_server);
    this.user_service = user_service;
  }

  init() {
    return {
      UsersPost: this.UsersPost,
      UsersGet: this.UsersGet,
      UsersDetailGet: this.UsersDetailGet,
      UsersDetailPut: this.UsersDetailPut,
    };
  }

  UsersPost = new Route({
    method: "post",
    path: "/api/users",
    schema: {
      ReqBody: z
        .object({
          user_name: z.string().min(1, "Username tidak boleh kosong!"),
          user_password: z.string().min(1, "Password tidak boleh kosong!"),
          user_email: z.string().min(1, "Email tidak boleh kosong!").email(),
          user_education_level: z.string().min(1).optional(),
          user_school: z.string().min(1).optional(),
          user_about_me: z.string().min(1).optional(),
          user_image: z.string().min(1).optional(),
          user_website: z.string().min(1).url().optional(),
          user_socials: z.string().min(1).url().array().min(1).optional(),
        })
        .strict(),
      ResBody: UserResponseSchema,
    },
    handler: async (req, res) => {
      const obj = req.body;

      const user_id = await this.user_service.addUser(obj);
      if (user_id == undefined) {
        throw new Error("Gagal menambahkan pengguna!");
      }

      const result = await this.user_service.getUserDetail(user_id.id);
      if (result == undefined) {
        throw new Error("Gagal menambahkan pengguna!");
      }

      res.status(201).json(result);
    },
  });

  UsersGet = new Route({
    method: "get",
    path: "/api/users",
    schema: {
      ResBody: UserResponseSchema.array(),
      ReqQuery: z.object({
        keyword: z.string().optional(),
      }),
    },
    handler: async (req, res) => {
      const { keyword } = req.query;
      const result = await this.user_service.getUsers({
        keyword,
      });
      res.status(200).json(result);
    },
  });
  UsersDetailGet = new Route({
    method: "get",
    path: "/api/users/:id",
    schema: {
      Params: z.object({
        id: zodStringReadableAsNumber("ID pengguna tidak valid"),
      }),
      ResBody: UserResponseSchema,
    },
    handler: async (req, res) => {
      const id = Number(req.params.id);
      const result = await this.user_service.getUserDetail(id);
      res.status(200).json(result);
    },
  });
  UsersDetailPut = new Route({
    method: "put",
    path: "/api/users/:id",
    schema: {
      Params: z.object({
        id: zodStringReadableAsNumber("ID pengguna tidak valid!"),
      }),
      ReqBody: z
        .object({
          user_name: z.string().min(1, "Nama tidak boleh kosong!").optional(),
          user_password: z.string().min(1, "Password tidak boleh kosong!").optional(),
          user_education_level: z.string().min(1, "Pendidikan tidak boleh kosong!").optional(),
          user_school: z.string().min(1, "Sekolah tidak boleh kosong!").optional(),
          user_about_me: z.string().min(1, "Biodata tidak boleh kosong!").optional(),
          user_image: z.string().min(1, "Gambar tidak boleh kosong!").optional(),
          user_email: z.string().min(1, "Email tidak boleh kosong!").email().optional(),
          user_website: z.string().min(1).url().optional(),
          user_socials: z.string().min(1).url().array().min(1).optional(),
        })
        .strict(),
      ResBody: UserResponseSchema,
    },
    handler: async (req, res) => {
      const obj = req.body;
      const user_id = Number(req.params.id);
      const sender_id = Number(req.session.user_id);

      await this.user_service.updateAccountDetail(user_id, obj, sender_id);
      const updated = await this.user_service.getUserDetail(user_id);
      res.status(200).json(updated);
    },
  });
}
