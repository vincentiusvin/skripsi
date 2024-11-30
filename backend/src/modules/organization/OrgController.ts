import type { Express } from "express";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller.js";
import { NotFoundError } from "../../helpers/error.js";
import { validateLogged } from "../../helpers/validate.js";
import {
  defaultError,
  zodPagination,
  zodStringReadableAsNumber,
} from "../../helpers/validators.js";
import { org_roles } from "./OrgMisc.js";
import { OrgService } from "./OrgService.js";

const OrgUpdateSchema = z.object({
  org_name: z.string(defaultError("Nama tidak valid!")).min(1).optional(),
  org_description: z.string(defaultError("Deskripsi tidak valid!")).min(1).optional(),
  org_address: z.string(defaultError("Alamat tidak valid!")).min(1).optional(),
  org_phone: z.string(defaultError("Nomor telepon tidak valid!")).min(1).optional(),
  org_image: z.string(defaultError("Gambar tidak valid!")).nullable().optional(),
  org_categories: z.number(defaultError("Kategori organisasi tidak valid!")).array().optional(),
});

const OrgCreationSchema = z.object({
  org_name: z.string(defaultError("Nama tidak valid!")).min(1),
  org_description: z.string(defaultError("Deskripsi tidak valid!")).min(1),
  org_address: z.string(defaultError("Alamat tidak valid!")).min(1),
  org_phone: z.string(defaultError("Nomor telepon tidak valid!")).min(1),
  org_image: z.string(defaultError("Gambar tidak valid!")).optional(),
  org_categories: z.number(defaultError("Kategori organisasi tidak valid!")).array().optional(),
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

const OrgMemberParamSchema = z.object({
  org_id: zodStringReadableAsNumber("Nomor organisasi tidak valid!"),
  user_id: zodStringReadableAsNumber("Nomor pengguna tidak valid!"),
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
        user_id: zodStringReadableAsNumber("Nomor pengguna tidak valid!").optional(),
        keyword: z.string(defaultError("Nama organisasi tidak valid!")).min(1).optional(),
        ...zodPagination(),
      }),
      ResBody: z.object({
        result: OrgResponseSchema.array(),
        total: z.number(),
      }),
    },

    handler: async (req, res) => {
      const { page, limit, user_id, keyword } = req.query;

      const opts = {
        user_id: user_id != undefined ? Number(user_id) : undefined,
        keyword: keyword != undefined && keyword.length > 0 ? keyword : undefined,
        limit: limit != undefined ? Number(limit) : undefined,
        page: limit != undefined ? Number(page) : undefined,
      };

      const result = await this.org_service.getOrgs(opts);
      const count = await this.org_service.countOrgs(opts);

      res.status(200).json({ result, total: Number(count.count) });
    },
  });
  OrgsDetailGet = new Route({
    method: "get",
    path: "/api/orgs/:org_id",
    schema: {
      Params: z.object({
        org_id: zodStringReadableAsNumber("Nomor organisasi tidak valid!"),
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
    priors: [validateLogged],
    schema: {
      ReqBody: OrgUpdateSchema,
      ResBody: OrgResponseSchema,
      Params: z.object({
        org_id: zodStringReadableAsNumber("Nomor organisasi tidak valid!"),
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
      Params: OrgMemberParamSchema,
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
    priors: [validateLogged],
    path: "/api/orgs/:org_id/users/:user_id",
    schema: {
      ResBody: z.object({
        role: z.enum(org_roles).or(z.literal("Not Involved")),
      }),
      ReqBody: z.object({
        role: z.enum(org_roles, defaultError("Peran anggota tidak valid!")),
      }),
      Params: OrgMemberParamSchema,
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
    priors: [validateLogged],
    path: "/api/orgs/:org_id/users/:user_id",
    schema: {
      Params: OrgMemberParamSchema,
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
