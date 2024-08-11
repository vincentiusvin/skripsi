import type { Express } from "express";
import { ZodType, z } from "zod";
import { Controller, Route } from "../../helpers/controller.js";
import { NotFoundError } from "../../helpers/error.js";
import { RH } from "../../helpers/types.js";
import { ProjectRoles, parseRole } from "./ProjectMisc.js";
import { ProjectService } from "./ProjectService.js";

export class ProjectController extends Controller {
  private project_service: ProjectService;
  constructor(express_server: Express, project_service: ProjectService) {
    super(express_server);
    this.project_service = project_service;
  }

  init() {
    return {
      ProjectsPost: new Route({
        handler: this.postProjects,
        method: "post",
        path: "/api/projects",
        schema: {
          ReqBody: z.object({
            project_name: z.string({ message: "Nama invalid!" }).min(1, "Nama tidak boleh kosong!"),
            org_id: z.number({ message: "Organisasi invalid!" }),
            project_desc: z
              .string({ message: "Deskripsi invalid!" })
              .min(1, "Deskripsi tidak boleh kosong!"),
            category_id: z.array(z.number(), { message: "Kategori invalid!" }).optional(),
          }),
        },
      }),
      ProjectsGet: new Route({
        handler: this.getProjects,
        method: "get",
        path: "/api/projects",
      }),
      ProjectsDetailGet: new Route({
        handler: this.getProjectsDetail,
        method: "get",
        path: "/api/projects/:project_id",
        schema: {
          Params: z.object({
            project_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID projek tidak valid!" }),
          }),
        },
      }),
      ProjectsDetailPut: new Route({
        handler: this.putProjectsDetail,
        method: "put",
        path: "/api/projects/:project_id",
        schema: {
          Params: z.object({
            project_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID projek tidak valid!" }),
          }),
          ReqBody: z.object({
            project_name: z
              .string({ message: "Nama invalid!" })
              .min(1, "Nama tidak boleh kosong!")
              .optional(),
            project_desc: z
              .string({ message: "Deskripsi invalid!" })
              .min(1, "Deskripsi tidak boleh kosong!")
              .optional(),
            category_id: z.array(z.number(), { message: "Kategori invalid!" }).optional(),
          }),
        },
      }),
      ProjectsDetailDelete: new Route({
        handler: this.deleteProject,
        method: "delete",
        path: "/api/projects/:project_id",
        schema: {
          Params: z.object({
            project_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID projek tidak valid!" }),
          }),
        },
      }),
      ProjectsDetailMembersGet: new Route({
        handler: this.getProjectsDetailMembersDetail,
        method: "get",
        path: "/api/projects/:project_id/users/:user_id",
        schema: {
          Params: z.object({
            project_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID projek tidak valid!" }),
            user_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID pengguna tidak valid!" }),
          }),
        },
      }),
      ProjectsDetailMembersPut: new Route({
        handler: this.putProjectsDetailMembersDetail,
        method: "put",
        path: "/api/projects/:project_id/users/:user_id",
        schema: {
          ReqBody: z.object({
            role: z
              .string()
              .min(1)
              .transform((arg) => parseRole(arg)) as ZodType<ProjectRoles>,
          }),
          Params: z.object({
            project_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID projek tidak valid!" }),
            user_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID pengguna tidak valid!" }),
          }),
        },
      }),
      ProjectsDetailMembersDelete: new Route({
        handler: this.deleteProjectsDetailMembersDetail,
        method: "delete",
        path: "/api/projects/:project_id/users/:user_id",
        schema: {
          Params: z.object({
            project_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID projek tidak valid!" }),
            user_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID pengguna tidak valid!" }),
          }),
        },
      }),
      ProjectsDetailBucketsGet: new Route({
        handler: this.getProjectsDetailBuckets,
        method: "get",
        path: "/api/projects/:project_id/buckets",
        schema: {
          Params: z.object({
            project_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID projek tidak valid!" }),
          }),
        },
      }),
      ProjectsDetailBucketsPost: new Route({
        handler: this.postProjectsDetailBuckets,
        method: "post",
        path: "/api/projects/:project_id/buckets",
        schema: {
          ReqBody: z.object({
            name: z.string({ message: "Nama invalid!" }).min(1, "Nama tidak boleh kosong!"),
          }),
          Params: z.object({
            project_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID projek tidak valid!" }),
          }),
        },
      }),
      ProjectsCategoriesGet: new Route({
        handler: this.getProjectsCategories,
        method: "get",
        path: "/api/project-categories",
      }),
    };
  }

  private getProjectsDetailMembersDetail: RH<{
    ResBody: {
      role: ProjectRoles;
    };
    Params: {
      project_id: string;
      user_id: string;
    };
  }> = async (req, res) => {
    const { project_id: project_id_str, user_id: user_id_str } = req.params;
    const project_id = Number(project_id_str);
    const user_id = Number(user_id_str);

    const result = await this.project_service.getMemberRole(project_id, user_id);
    res.status(200).json({ role: result });
  };

  private putProjectsDetailMembersDetail: RH<{
    ResBody: {
      role: ProjectRoles;
    };
    ReqBody: {
      role: ProjectRoles;
    };
    Params: {
      project_id: string;
      user_id: string;
    };
  }> = async (req, res) => {
    const { project_id: project_id_str, user_id: user_id_str } = req.params;
    const project_id = Number(project_id_str);
    const user_id = Number(user_id_str);
    const sender_id = req.session.user_id!;
    const role = req.body.role;

    await this.project_service.assignMember(project_id, user_id, sender_id, role);

    const result = await this.project_service.getMemberRole(project_id, user_id);
    res.json({ role: result });
  };

  private deleteProjectsDetailMembersDetail: RH<{
    ResBody: {
      role: ProjectRoles;
    };
    Params: {
      project_id: string;
      user_id: string;
    };
  }> = async (req, res) => {
    const { project_id: project_id_str, user_id: user_id_str } = req.params;
    const project_id = Number(project_id_str);
    const user_id = Number(user_id_str);
    const sender_id = req.session.user_id!;

    await this.project_service.unassignMember(project_id, user_id, sender_id);

    const result = await this.project_service.getMemberRole(project_id, user_id);
    res.status(200).json({ role: result });
  };

  private getProjects: RH<{
    ResBody: {
      org_id: number;
      project_id: number;
      project_name: string;
      project_desc: string;
      project_members: {
        user_id: number;
        role: string;
      }[];
      project_categories: {
        category_name: string;
        category_id: number;
      }[];
    }[];
    ReqQuery: {
      org_id?: string;
      user_id?: string;
      keyword?: string;
    };
  }> = async (req, res) => {
    const { org_id, user_id, keyword } = req.query;

    const result = await this.project_service.getProjects({
      org_id: org_id != undefined ? Number(org_id) : undefined,
      user_id: user_id != undefined ? Number(user_id) : undefined,
      keyword,
    });

    res.status(200).json(result);
  };

  private putProjectsDetail: RH<{
    ResBody: {
      org_id: number;
      project_id: number;
      project_name: string;
      project_desc: string;
      project_members: {
        user_id: number;
        role: string;
      }[];
      project_categories: {
        category_name: string;
        category_id: number;
      }[];
    };
    ReqBody: {
      project_name?: string;
      project_desc?: string;
      category_id?: number[];
    };
    Params: {
      project_id: string;
    };
  }> = async (req, res) => {
    const project_id = Number(req.params.project_id);
    const obj = req.body;

    await this.project_service.updateProject(project_id, obj);

    const result = await this.project_service.getProjectByID(project_id);

    res.status(200).json(result);
  };

  private deleteProject: RH<{
    Params: {
      project_id: string;
    };
    ResBody: {
      msg: string;
    };
  }> = async (req, res) => {
    const project_id = Number(req.params.project_id);

    await this.project_service.deleteProject(project_id);

    res.status(200).json({ msg: "Projek berhasil dihapus!" });
  };

  private getProjectsDetail: RH<{
    ResBody: {
      org_id: number;
      project_id: number;
      project_name: string;
      project_desc: string;
      project_members: {
        user_id: number;
        role: string;
      }[];
      project_categories: {
        category_name: string;
        category_id: number;
      }[];
    };
    Params: {
      project_id: string;
    };
  }> = async (req, res) => {
    const project_id = req.params.project_id;

    const result = await this.project_service.getProjectByID(Number(project_id));
    if (result === undefined) {
      throw new NotFoundError("Projek tidak ditemukan!");
    }
    res.status(200).json(result);
  };

  private postProjects: RH<{
    ReqBody: {
      project_name: string;
      org_id: number;
      project_desc: string;
      category_id?: number[];
    };
    ResBody: {
      org_id: number;
      project_id: number;
      project_name: string;
      project_desc: string;
      project_members: {
        user_id: number;
        role: string;
      }[];
      project_categories: {
        category_name: string;
        category_id: number;
      }[];
    };
  }> = async (req, res) => {
    const { project_name, org_id, project_desc, category_id } = req.body;

    const project_id = await this.project_service.addProject({
      org_id,
      project_desc,
      project_name,
      category_id,
    });

    const result = await this.project_service.getProjectByID(project_id);
    res.status(201).json(result);
  };

  private getProjectsCategories: RH<{
    ResBody: {
      category_id: number;
      category_name: string;
    }[];
  }> = async (req, res) => {
    const result = await this.project_service.getCategories();
    res.status(200).json(result);
  };

  private getProjectsDetailBuckets: RH<{
    Params: {
      project_id: string;
    };
    ResBody: {
      name: string;
      id: number;
    }[];
  }> = async (req, res) => {
    const { project_id } = req.params;

    const result = await this.project_service.getBuckets(Number(project_id));
    res.status(200).json(result);
  };

  private postProjectsDetailBuckets: RH<{
    Params: {
      project_id: string;
    };
    ReqBody: {
      name: string;
    };
    ResBody: {
      msg: string;
    };
  }> = async (req, res) => {
    const { project_id } = req.params;
    const { name } = req.body;

    await this.project_service.addBucket(Number(project_id), name);

    // TODO: split to task domain
    res.status(201).json({
      msg: "Bucket created!",
    });
  };
}
