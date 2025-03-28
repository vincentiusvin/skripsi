import type { Express } from "express";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller.js";
import { AuthError, NotFoundError } from "../../helpers/error.js";
import { validateLogged } from "../../helpers/validate.js";
import {
  defaultError,
  zodPagination,
  zodStringReadableAsNumber,
} from "../../helpers/validators.js";
import { otp_types } from "./UserMisc.js";
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
  user_website: z.string(defaultError("Website tidak valid!")).min(1).url().nullable().optional(),
  user_socials: z.string(defaultError("Media sosial tidak valid!")).min(1).url().array().optional(),
});

const UserUpdatePasswordSchema = z.object({
  user_password: z.string(defaultError("Password tidak valid!")).min(1),
  token: z.string(defaultError("Token reset password tidak valid!")).uuid().min(1).optional(),
});

const UserUpdateEmailSchema = z.object({
  user_email: z.string(defaultError("Email tidak valid!")).min(1).email(),
  token: z.string(defaultError("Token registrasi tidak valid!")).uuid(),
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
  email: z.string(defaultError("Email tidak valid!")).min(1).email(),
  type: z.enum(otp_types, defaultError("Tipe OTP tidak valid!")),
});

const OTPResponseSchema = z.object({
  token: z.string(),
  email: z.string(),
  type: z.enum(otp_types),
  created_at: z.date(),
  used_at: z.date().nullable(),
  verified_at: z.date().nullable(),
});

const OTPParamsSchema = z.object({
  token: z.string(defaultError("Token tidak valid!")).uuid().min(1),
});

// Tidak restful demi security
// Token optimalnya masuk path di url
const OTPUpdateSchema = z.object({
  otp: z.string(defaultError("Kode OTP tidak valid!")).min(1),
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
      UsersDetailPutEmail: this.UsersDetailPutEmail,
      UsersDetailPutPassword: this.UsersDetailPutPassword,
      UsersDetailPut: this.UsersDetailPut,
      OTPPost: this.OTPPost,
      // mikir dulu mau atau nggak
      // OTPDetailGet: this.OTPDetailGet,
      OTPDetailGetUser: this.OTPDetailGetUser,
      OTPDetailMail: this.OTPDetailMail,
      OTPDetailPut: this.OTPDetailPut,
      UsersValidate: this.UsersValidate,
    };
  }

  OTPPost = new Route({
    method: "post",
    path: "/api/otps",
    schema: {
      ReqBody: OTPCreationSchema.strict(),
      ResBody: OTPResponseSchema,
    },
    handler: async (req, res) => {
      const { email, type } = req.body;

      const token = await this.user_service.addOTP({ email, type });

      const result = await this.user_service.getOTP(token.token);
      res.status(201).json(result);
    },
  });

  OTPDetailGet = new Route({
    method: "get",
    path: "/api/otps/:token",
    schema: {
      Params: OTPParamsSchema,
      ResBody: OTPResponseSchema,
    },
    handler: async (req, res) => {
      const { token } = req.params;
      const result = await this.user_service.getOTP(token);
      res.status(200).json(result);
    },
  });

  OTPDetailGetUser = new Route({
    method: "get",
    path: "/api/otps/:token/user",
    schema: {
      Params: OTPParamsSchema,
      ResBody: z.object({
        user_id: z.number().optional(),
      }),
    },
    handler: async (req, res) => {
      const { token } = req.params;
      const result = await this.user_service.findUserByOTP(token);
      res.status(200).json({ user_id: result?.user_id });
    },
  });

  OTPDetailPut = new Route({
    method: "put",
    path: "/api/otps/:token",
    schema: {
      Params: OTPParamsSchema,
      ReqBody: OTPUpdateSchema.strict(),
      ResBody: OTPResponseSchema,
    },
    handler: async (req, res) => {
      const { otp } = req.body;
      const { token } = req.params;
      await this.user_service.verifyOTP(token, otp);
      const result = await this.user_service.getOTP(token);
      res.status(200).json(result);
    },
  });

  OTPDetailMail = new Route({
    method: "post",
    path: "/api/otps/:token/email",
    schema: {
      Params: OTPParamsSchema,
      ResBody: z.object({
        msg: z.string(),
      }),
    },
    handler: async (req, res) => {
      const { token } = req.params;
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
        existing: z.literal("true").optional(),
      }),
    },
    handler: async (req, res) => {
      const { name, email, existing } = req.query;

      const result = await this.user_service.validateUser(
        { user_name: name, user_email: email },
        existing === "true",
      );

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
      if (result == undefined) {
        throw new NotFoundError("Gagal menemukan pengguna!");
      }
      res.status(200).json(result);
    },
  });
  UsersDetailPut = new Route({
    method: "put",
    path: "/api/users/:id",
    priors: [validateLogged],
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

  UsersDetailPutPassword = new Route({
    method: "put",
    path: "/api/users/:id/password",
    schema: {
      Params: z.object({
        id: zodStringReadableAsNumber("ID pengguna tidak valid!"),
      }),
      ReqBody: UserUpdatePasswordSchema,
      ResBody: UserResponseSchema,
    },
    handler: async (req, res) => {
      const { user_password, token } = req.body;
      const user_id = Number(req.params.id);
      const sender_id = req.session.user_id !== undefined ? Number(req.session.user_id) : undefined;

      let credentials:
        | {
            sender_id: number;
          }
        | {
            token: string;
          }
        | undefined;

      if (token != undefined) {
        credentials = {
          token,
        };
      } else if (sender_id != undefined) {
        credentials = {
          sender_id,
        };
      }

      if (credentials == undefined) {
        throw new AuthError("Anda perlu login atau memasukkan token untuk mengubah password!");
      }

      await this.user_service.updatePassword(user_id, user_password, credentials);
      const updated = await this.user_service.getUserDetail(user_id);
      res.status(200).json(updated);
    },
  });

  UsersDetailPutEmail = new Route({
    method: "put",
    path: "/api/users/:id/email",
    priors: [validateLogged],
    schema: {
      Params: z.object({
        id: zodStringReadableAsNumber("ID pengguna tidak valid!"),
      }),
      ReqBody: UserUpdateEmailSchema,
      ResBody: UserResponseSchema,
    },
    handler: async (req, res) => {
      const obj = req.body;
      const user_id = Number(req.params.id);
      const sender_id = Number(req.session.user_id);

      await this.user_service.updateAccountEmail(user_id, obj, sender_id);
      const updated = await this.user_service.getUserDetail(user_id);
      res.status(200).json(updated);
    },
  });
}
