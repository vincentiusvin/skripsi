import type { Express } from "express";
import { ZodType, z } from "zod";
import { Controller, Route } from "../../helpers/controller.js";
import { NotFoundError } from "../../helpers/error.js";
import { validateLogged } from "../../helpers/validate.js";
import { zodStringReadableAsNumber } from "../../helpers/validators.js";
import { OrgRoles, org_roles, parseRole } from "./OrgMisc.js";
import { OrgService } from "./OrgService.js";

const OrgUpdateSchema = z.object({
  org_name: z
    .string({ message: "Nama invalid!" })
    .min(1, { message: "Nama tidak boleh kosong!" })
    .optional(),
  org_description: z
    .string({ message: "Deskripsi invalid!" })
    .min(1, { message: "Deskripsi tidak boleh kosong!" })
    .optional(),
  org_address: z
    .string({ message: "Alamat invalid!" })
    .min(1, { message: "Alamat tidak boleh kosong!" })
    .optional(),
  org_phone: z
    .string({ message: "Nomor telefon invalid!" })
    .min(1, { message: "Nomor telefon tidak boleh kosong!" })
    .optional(),
  org_image: z.string({ message: "Deskripsi invalid!" }).nullable().optional(),
  org_categories: z.array(z.number(), { message: "Kategori invalid!" }).optional(),
});

const OrgCreationSchema = z.object({
  org_name: z.string({ message: "Nama invalid!" }).min(1, { message: "Nama tidak boleh kosong!" }),
  org_description: z
    .string({ message: "Deskripsi invalid!" })
    .min(1, { message: "Deskripsi tidak boleh kosong!" }),
  org_address: z
    .string({ message: "Alamat invalid!" })
    .min(1, { message: "Alamat tidak boleh kosong!" }),
  org_phone: z
    .string({ message: "Nomor telefon invalid!" })
    .min(1, { message: "Nomor telefon tidak boleh kosong!" }),
  org_image: z.string({ message: "Gambar invalid!" }).min(1).optional(),
  org_categories: z.array(z.number(), { message: "Kategori invalid!" }).optional(),
});

const OrgResponseSchema = z.object({
  org_id: z.number(),
  org_name: z.string(),
  org_description: z.string(),
  org_address: z.string(),
  org_phone: z.string(),
  org_image: z.string().nullable(),
  org_categories: z.array(
    z.object({
      category_name: z.string(),
      category_id: z.number(),
    }),
  ),
  org_users: z
    .object({
      user_id: z.number(),
      user_role: z.enum(org_roles).or(z.literal("Not Involved")),
    })
    .array(),
});

export class OrgController extends Controller {
  private org_service: OrgService;
  constructor(express_server: Express, org_service: OrgService) {
    super(express_server);
    this.org_service = org_service;
  }

  init() {
    return {
      OrgsPost: this.OrgsPost,
      OrgsGet: this.OrgsGet,
      OrgsDetailGet: this.OrgsDetailGet,
      OrgsCategoriesGet: this.OrgsCategoriesGet,
      OrgsUpdate: this.OrgsUpdate,
      OrgsDetailMembersDetailGet: this.OrgsDetailMembersDetailGet,
      OrgsDetailMembersDetailPut: this.OrgsDetailMembersDetailPut,
      OrgsDetailMembersDetailDelete: this.OrgsDetailMembersDetailDelete,
    };
  }

  OrgsPost = new Route({
    method: "post",
    path: "/api/orgs",
    schema: {
      ReqBody: OrgCreationSchema,
      ResBody: OrgResponseSchema,
    },
    priors: [validateLogged],
    handler: async (req, res) => {
      const { org_name, org_description, org_address, org_phone, org_image, org_categories } =
        req.body;
      const userID = req.session.user_id!;

      const created_id = await this.org_service.addOrg(
        {
          org_name,
          org_address,
          org_description,
          org_phone,
          org_categories,
          org_image,
        },
        userID,
      );

      const created = await this.org_service.getOrgByID(created_id.id);
      if (!created) {
        throw new Error("Organisasi gagal dibuat!");
      }
      res.status(201).json(created);
    },
  });
  OrgsGet = new Route({
    method: "get",
    path: "/api/orgs",
    schema: {
      ReqQuery: z.object({
        user_id: zodStringReadableAsNumber("Id pengguna invalid!").optional(),
      }),
      ResBody: OrgResponseSchema.array(),
    },

    handler: async (req, res) => {
      const { user_id } = req.query;
      const result = await this.org_service.getOrgs({
        user_id: user_id != undefined ? Number(user_id) : undefined,
      });
      res.status(200).json(result);
    },
  });
  OrgsDetailGet = new Route({
    method: "get",
    path: "/api/orgs/:org_id",
    schema: {
      Params: z.object({
        org_id: zodStringReadableAsNumber("ID tidak valid!"),
      }),
      ResBody: OrgResponseSchema,
    },
    handler: async (req, res) => {
      const org_id = Number(req.params.org_id);

      const result = await this.org_service.getOrgByID(org_id);
      if (result === undefined) {
        throw new NotFoundError("Organisasi tidak ditemukan!");
      }
      res.status(200).json(result);
    },
  });

  OrgsCategoriesGet = new Route({
    method: "get",
    path: "/api/org-categories",
    schema: {
      ResBody: z
        .object({
          category_id: z.number(),
          category_name: z.string(),
        })
        .array(),
    },
    handler: async (req, res) => {
      const categories = await this.org_service.getOrgCategories();
      res.status(200).json(categories);
    },
  });

  OrgsUpdate = new Route({
    schema: {
      ReqBody: OrgUpdateSchema,
      ResBody: OrgResponseSchema,
      Params: z.object({
        org_id: zodStringReadableAsNumber("ID organisasi tidak valid!"),
      }),
    },
    method: "put",
    path: "/api/orgs/:org_id",
    handler: async (req, res) => {
      const { org_name, org_description, org_address, org_phone, org_image, org_categories } =
        req.body;
      const org_id = Number(req.params.org_id);
      const sender_id = req.session.user_id!;

      await this.org_service.updateOrg(
        Number(org_id),
        {
          org_name,
          org_address,
          org_category: org_categories,
          org_description,
          org_image,
          org_phone,
        },
        sender_id,
      );
      const updated = await this.org_service.getOrgByID(Number(org_id));

      res.status(200).json(updated);
    },
  });
  OrgsDetailMembersDetailGet = new Route({
    method: "get",
    path: "/api/orgs/:org_id/users/:user_id",
    schema: {
      Params: z.object({
        org_id: zodStringReadableAsNumber("ID organisasi tidak valid!"),
        user_id: zodStringReadableAsNumber("ID pengguna tidak valid!"),
      }),
      ResBody: z.object({
        role: z.enum(org_roles).or(z.literal("Not Involved")),
      }),
    },
    handler: async (req, res) => {
      const { org_id: org_id_str, user_id: user_id_str } = req.params;
      const org_id = Number(org_id_str);
      const user_id = Number(user_id_str);

      const result = await this.org_service.getMemberRole(org_id, user_id);
      res.status(200).json({ role: result });
    },
  });
  OrgsDetailMembersDetailPut = new Route({
    method: "put",
    path: "/api/orgs/:org_id/users/:user_id",
    schema: {
      ResBody: z.object({
        role: z.enum(org_roles).or(z.literal("Not Involved")),
      }),
      ReqBody: z.object({
        role: z
          .string()
          .min(1)
          .transform((arg) => parseRole(arg)) as ZodType<OrgRoles>,
      }),
      Params: z.object({
        org_id: zodStringReadableAsNumber("ID organisasi tidak valid!"),
        user_id: zodStringReadableAsNumber("ID pengguna tidak valid!"),
      }),
    },
    handler: async (req, res) => {
      const { org_id: org_id_str, user_id: user_id_str } = req.params;
      const org_id = Number(org_id_str);
      const user_id = Number(user_id_str);
      const role = req.body.role;
      const sender_id = Number(req.session.user_id!);

      await this.org_service.assignMember(org_id, user_id, sender_id, role);

      const result = await this.org_service.getMemberRole(org_id, user_id);
      res.json({ role: result });
    },
  });
  OrgsDetailMembersDetailDelete = new Route({
    method: "delete",
    path: "/api/orgs/:org_id/users/:user_id",
    schema: {
      Params: z.object({
        org_id: zodStringReadableAsNumber("ID organisasi tidak valid!"),
        user_id: zodStringReadableAsNumber("ID pengguna tidak valid!"),
      }),
      ResBody: z.object({
        role: z.enum(org_roles).or(z.literal("Not Involved")),
      }),
    },
    handler: async (req, res) => {
      const { org_id: org_id_str, user_id: user_id_str } = req.params;
      const org_id = Number(org_id_str);
      const user_id = Number(user_id_str);
      const sender_id = Number(req.session.user_id!);

      await this.org_service.unassignMember(org_id, user_id, sender_id);

      const result = await this.org_service.getMemberRole(org_id, user_id);
      res.status(200).json({ role: result });
    },
  });
}
