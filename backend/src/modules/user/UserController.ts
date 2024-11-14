import type { Express } from "express";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller.js";
import {
  defaultError,
  zodPagination,
  zodStringReadableAsNumber,
} from "../../helpers/validators.js";
import { UserService } from "./UserService.js";

const UserResponseSchema = z.object({
  user_id: z.number(),
  user_name: z.string(),
  user_email: z.string(),
  user_education_level: z.string().nullable(),
  user_school: z.string().nullable(),
  user_about_me: z.string().nullable(),
  user_image: z.string().nullable(),
  user_workplace: z.string().nullable(),
  user_location: z.string().nullable(),
  user_website: z.string().nullable(),
  user_is_admin: z.boolean(),
  user_created_at: z.date(),
  user_socials: z
    .object({
      social: z.string(),
    })
    .array(),
});

const UserUpdateSchema = z.object({
  user_name: z.string(defaultError("Nama pengguna tidak valid!")).min(1).optional(),
  user_password: z.string(defaultError("Password tidak valid!")).min(1).optional(),
  user_education_level: z
    .string(defaultError("Jenjang pendidikan tidak valid!"))
    .min(1)
    .nullable()
    .optional(),
  user_school: z
    .string(defaultError("Institusi pendidikan tidak valid!"))
    .min(1)
    .nullable()
    .optional(),
  user_about_me: z.string(defaultError("Biodata tidak valid!")).min(1).nullable().optional(),
  user_workplace: z.string(defaultError("Tempat kerja tidak valid!")).min(1).nullable().optional(),
  user_location: z.string(defaultError("Lokasi tidak valid!")).min(1).nullable().optional(),
  user_image: z.string(defaultError("Gambar tidak valid!")).min(1).nullable().optional(),
  user_email: z.string(defaultError("Email tidak valid!")).min(1).email().optional(),
  user_website: z.string(defaultError("Website tidak valid!")).min(1).url().nullable().optional(),
  user_socials: z.string(defaultError("Media sosial tidak valid!")).min(1).url().array().optional(),
});

const UserCreationSchema = z.object({
  registration_token: z.string(defaultError("Token registrasi tidak valid!")).uuid(),
  user_name: z.string(defaultError("Nama pengguna tidak valid!")).min(1),
  user_password: z.string(defaultError("Password tidak valid!")).min(1),
  user_email: z.string(defaultError("Email tidak valid!")).min(1).email(),
  user_education_level: z.string(defaultError("Jenjang pendidikan tidak valid!")).min(1).optional(),
  user_school: z.string(defaultError("Institusi pendidikan tidak valid!")).min(1).optional(),
  user_about_me: z.string(defaultError("Biodata tidak valid!")).min(1).optional(),
  user_workplace: z.string(defaultError("Tempat kerja tidak valid!")).min(1).optional(),
  user_location: z.string(defaultError("Lokasi tidak valid!")).min(1).optional(),
  user_image: z.string(defaultError("Gambar tidak valid!")).min(1).optional(),
  user_website: z.string(defaultError("Website tidak valid!")).min(1).url().optional(),
  user_socials: z.string(defaultError("Media sosial tidak valid!")).min(1).url().array().optional(),
});

const OTPCreationSchema = z.object({
  user_email: z.string(defaultError("Email tidak valid!")).min(1).email(),
});

// Tidak restful demi security
// Token optimalnya masuk path di url
const OTPUpdateSchema = z.object({
  token: z.string(defaultError("Token tidak valid!")).uuid().min(1),
  otp: z.string(defaultError("Kode OTP tidak valid!")).min(1),
});

const OTPResendSchema = z.object({
  token: z.string(defaultError("Token tidak valid!")).uuid().min(1),
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
      OTPsPost: this.OTPsPost,
      OTPsMail: this.OTPsMail,
      OTPsPut: this.OTPsPut,
      UsersValidate: this.UsersValidate,
    };
  }

  OTPsPost = new Route({
    method: "post",
    path: "/api/otps",
    schema: {
      ReqBody: OTPCreationSchema.strict(),
      ResBody: z.object({
        token: z.string(),
        created_at: z.date(),
      }),
    },
    handler: async (req, res) => {
      const { user_email } = req.body;

      const result = await this.user_service.addOTP({ email: user_email });

      res.status(201).json(result);
    },
  });

  OTPsPut = new Route({
    method: "put",
    path: "/api/otps",
    schema: {
      ReqBody: OTPUpdateSchema.strict(),
      ResBody: z.object({
        msg: z.string(),
      }),
    },
    handler: async (req, res) => {
      const { otp, token } = req.body;
      await this.user_service.verifyOTP(token, otp);
      res.status(200).json({ msg: "Berhasil memverifikasi email!" });
    },
  });

  OTPsMail = new Route({
    method: "post",
    path: "/api/otps-mail",
    schema: {
      ReqBody: OTPResendSchema.strict(),
      ResBody: z.object({
        msg: z.string(),
      }),
    },
    handler: async (req, res) => {
      const { token } = req.body;
      await this.user_service.sendOTPMail(token);
      res.status(200).json({ msg: "Berhasil mengirimkan email konfirmasi!" });
    },
  });

  UsersPost = new Route({
    method: "post",
    path: "/api/users",
    schema: {
      ReqBody: UserCreationSchema.strict(),
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

      req.session.user_id = user_id.id;
      res.status(201).json(result);
    },
  });

  UsersValidate = new Route({
    method: "get",
    path: "/api/users-validation",
    schema: {
      ResBody: z.object({
        name: z.string().optional(),
        email: z.string().optional(),
      }),
      ReqQuery: z.object({
        name: z.string().optional(),
        email: z.string().optional(),
      }),
    },
    handler: async (req, res) => {
      const { name, email } = req.query;

      const result = await this.user_service.validateUser({ user_name: name, user_email: email });

      res.status(200).json(result);
    },
  });

  UsersGet = new Route({
    method: "get",
    path: "/api/users",
    schema: {
      ResBody: z.object({
        result: UserResponseSchema.array(),
        total: z.number(),
      }),
      ReqQuery: z.object({
        keyword: z.string().optional(),
        ...zodPagination(),
      }),
    },
    handler: async (req, res) => {
      const { keyword, page, limit } = req.query;
      const opts = {
        keyword,
        page: page !== undefined ? Number(page) : undefined,
        limit: limit !== undefined ? Number(limit) : undefined,
      };

      const result = await this.user_service.getUsers(opts);
      const count = await this.user_service.countUsers(opts);
      res.status(200).json({ result, total: Number(count.count) });
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
      ReqBody: UserUpdateSchema.strict(),
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
