import type { Express } from "express";
import { RequestHandler } from "express";
import { ZodType, z } from "zod";
import { Controller, Route } from "../../helpers/controller.js";
import { NotFoundError } from "../../helpers/error.js";
import { RH } from "../../helpers/types.js";
import { validateLogged } from "../../helpers/validate.js";
import { OrgRoles, parseRole } from "./OrgMisc.js";
import { OrgService } from "./OrgService.js";

export class OrgController extends Controller {
  private org_service: OrgService;
  constructor(express_server: Express, org_service: OrgService) {
    super(express_server);
    this.org_service = org_service;
  }

  init() {
    return {
      OrgsPost: new Route({
        handler: this.postOrgs,
        method: "post",
        path: "/api/orgs",
        schema: {
          ReqBody: z.object({
            org_name: z
              .string({ message: "Nama invalid!" })
              .min(1, { message: "Nama tidak boleh kosong!" }),
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
          }),
        },
        priors: [validateLogged as RequestHandler],
      }),
      OrgsGet: new Route({
        handler: this.getOrgs,
        method: "get",
        path: "/api/orgs",
      }),
      OrgsDetailGet: new Route({
        handler: this.getOrgsDetail,
        method: "get",
        path: "/api/orgs/:org_id",
        schema: {
          Params: z.object({
            org_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID tidak valid!" }),
          }),
        },
      }),
      OrgsCategoriesGet: new Route({
        handler: this.getOrgsCategories,
        method: "get",
        path: "/api/org-categories",
      }),
      OrgsUpdate: new Route({
        handler: this.updateOrgs,
        schema: {
          Params: z.object({
            org_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID organisasi tidak valid!" }),
          }),
          ReqBody: z.object({
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
            org_image: z.string({ message: "Deskripsi invalid!" }).optional(),
            org_categories: z.array(z.number(), { message: "Kategori invalid!" }).optional(),
          }),
        },
        method: "put",
        path: "/api/orgs/:org_id",
      }),
      OrgsDelete: new Route({
        handler: this.deleteOrgs,
        method: "delete",
        path: "/api/orgs/:org_id",
        schema: {
          Params: z.object({
            org_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID organisasi tidak valid!" }),
          }),
        },
      }),
      OrgsDetailMembersDetailGet: new Route({
        handler: this.getOrgDetailMembersDetail,
        method: "get",
        path: "/api/orgs/:org_id/users/:user_id",
        schema: {
          Params: z.object({
            org_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID organisasi tidak valid!" }),
            user_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID pengguna tidak valid!" }),
          }),
        },
      }),
      OrgsDetailMembersDetailPut: new Route({
        handler: this.putOrgDetailMembersDetail,
        method: "put",
        path: "/api/orgs/:org_id/users/:user_id",
        schema: {
          ReqBody: z.object({
            role: z
              .string()
              .min(1)
              .transform((arg) => parseRole(arg)) as ZodType<OrgRoles>,
          }),
          Params: z.object({
            org_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID organisasi tidak valid!" }),
            user_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID pengguna tidak valid!" }),
          }),
        },
      }),
      OrgsDetailMembersDetailDelete: new Route({
        handler: this.deleteOrgDetailMembersDetail,
        method: "delete",
        path: "/api/orgs/:org_id/users/:user_id",
        schema: {
          Params: z.object({
            org_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID organisasi tidak valid!" }),
            user_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID pengguna tidak valid!" }),
          }),
        },
      }),
    };
  }

  getOrgs: RH<{
    ResBody: {
      org_id: number;
      org_name: string;
      org_description: string;
      org_address: string;
      org_phone: string;
      org_image: string | null;
      org_categories: {
        category_name: string;
        category_id: number;
      }[];
      org_users: {
        user_id: number;
        user_role: OrgRoles;
      }[];
    }[];
    ReqQuery: {
      user_id?: string;
    };
  }> = async (req, res) => {
    const { user_id } = req.query;
    const result = await this.org_service.getOrgs({
      user_id: user_id != undefined ? Number(user_id) : undefined,
    });
    res.status(200).json(result);
  };

  getOrgsDetail: RH<{
    Params: { org_id: string };
    ResBody: {
      org_id: number;
      org_name: string;
      org_description: string;
      org_address: string;
      org_phone: string;
      org_image: string | null;
      org_categories: {
        category_name: string;
        category_id: number;
      }[];
      org_users: {
        user_id: number;
        user_role: OrgRoles;
      }[];
    };
  }> = async (req, res) => {
    const org_id = Number(req.params.org_id);

    const result = await this.org_service.getOrgByID(org_id);
    if (result === undefined) {
      throw new NotFoundError("Organisasi tidak ditemukan!");
    }
    res.status(200).json(result);
  };

  postOrgs: RH<{
    ResBody: {
      org_id: number;
      org_name: string;
      org_description: string;
      org_address: string;
      org_phone: string;
      org_image: string | null;
      org_categories: {
        category_name: string;
        category_id: number;
      }[];
      org_users: {
        user_id: number;
        user_role: OrgRoles;
      }[];
    };
    ReqBody: {
      org_name: string;
      org_description: string;
      org_address: string;
      org_phone: string;
      org_image?: string;
      org_categories?: number[];
    };
  }> = async (req, res) => {
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
  };

  getOrgsCategories: RH<{
    ResBody: {
      category_id: number;
      category_name: string;
    }[];
  }> = async (req, res) => {
    const categories = await this.org_service.getOrgCategories();
    res.status(200).json(categories);
  };

  updateOrgs: RH<{
    ResBody: {
      org_id: number;
      org_name: string;
      org_description: string;
      org_address: string;
      org_phone: string;
      org_image: string | null;
      org_categories: {
        category_name: string;
        category_id: number;
      }[];
      org_users: {
        user_id: number;
        user_role: OrgRoles;
      }[];
    };
    Params: {
      org_id: string;
    };
    ReqBody: {
      org_name?: string;
      org_description?: string;
      org_address?: string;
      org_phone?: string;
      org_image?: string;
      org_categories?: number[];
    };
  }> = async (req, res) => {
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
  };

  deleteOrgs: RH<{
    ResBody: {
      msg: string;
    };
    Params: {
      org_id: string;
    };
  }> = async (req, res) => {
    const org_id = Number(req.params.org_id);
    const sender_id = req.session.user_id!;

    await this.org_service.deleteOrg(org_id, sender_id);
    res.status(200).json({ msg: "Organisasi berhasil di hapus" });
  };

  private putOrgDetailMembersDetail: RH<{
    ResBody: {
      role: OrgRoles;
    };
    ReqBody: {
      role: OrgRoles;
    };
    Params: {
      org_id: string;
      user_id: string;
    };
  }> = async (req, res) => {
    const { org_id: org_id_str, user_id: user_id_str } = req.params;
    const org_id = Number(org_id_str);
    const user_id = Number(user_id_str);
    const role = req.body.role;
    const sender_id = Number(req.session.user_id!);

    await this.org_service.assignMember(org_id, user_id, sender_id, role);

    const result = await this.org_service.getMemberRole(org_id, user_id);
    res.json({ role: result });
  };

  private getOrgDetailMembersDetail: RH<{
    ResBody: {
      role: OrgRoles;
    };
    Params: {
      org_id: string;
      user_id: string;
    };
  }> = async (req, res) => {
    const { org_id: org_id_str, user_id: user_id_str } = req.params;
    const org_id = Number(org_id_str);
    const user_id = Number(user_id_str);

    const result = await this.org_service.getMemberRole(org_id, user_id);
    res.status(200).json({ role: result });
  };

  private deleteOrgDetailMembersDetail: RH<{
    ResBody: {
      role: OrgRoles;
    };
    Params: {
      org_id: string;
      user_id: string;
    };
  }> = async (req, res) => {
    const { org_id: org_id_str, user_id: user_id_str } = req.params;
    const org_id = Number(org_id_str);
    const user_id = Number(user_id_str);
    const sender_id = Number(req.session.user_id!);

    await this.org_service.unassignMember(org_id, user_id, sender_id);

    const result = await this.org_service.getMemberRole(org_id, user_id);
    res.status(200).json({ role: result });
  };
}
