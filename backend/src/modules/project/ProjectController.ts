import type { Express } from "express";
import { ZodType, z } from "zod";
import { Controller, Route } from "../../helpers/controller.js";
import { NotFoundError } from "../../helpers/error.js";
import { zodPagination, zodStringReadableAsNumber } from "../../helpers/validators.js";
import { ProjectRoles, parseRole, project_roles } from "./ProjectMisc.js";
import { ProjectService } from "./ProjectService.js";

export class ProjectController extends Controller {
  private project_service: ProjectService;
  constructor(express_server: Express, project_service: ProjectService) {
    super(express_server);
    this.project_service = project_service;
  }

  init() {
    return {
      ProjectsPost: this.ProjectsPost,
      ProjectsGet: this.ProjectsGet,
      ProjectsDetailGet: this.ProjectsDetailGet,
      ProjectsDetailPut: this.ProjectsDetailPut,
      ProjectsDetailMembersGet: this.ProjectsDetailMembersGet,
      ProjectsDetailMembersPut: this.ProjectsDetailMembersPut,
      ProjectsDetailMembersDelete: this.ProjectsDetailMembersDelete,
      ProjectsCategoriesGet: this.ProjectsCategoriesGet,
      ProjectsDetailEventsGet: this.ProjectsDetailEventsGet,
    };
  }
  ProjectsPost = new Route({
    handler: async (req, res) => {
      const { project_name, org_id, project_desc, category_id } = req.body;
      const sender_id = req.session.user_id!;

      const project_id = await this.project_service.addProject(
        {
          org_id,
          project_desc,
          project_name,
          category_id,
        },
        sender_id,
      );

      const result = await this.project_service.getProjectByID(project_id);
      res.status(201).json(result);
    },
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
      ResBody: z.object({
        org_id: z.number(),
        project_id: z.number(),
        project_archived: z.boolean(),
        project_name: z.string(),
        project_desc: z.string(),
        project_members: z
          .object({
            user_id: z.number(),
            role: z.enum(project_roles).or(z.literal("Not Involved")),
          })
          .array(),
        project_categories: z
          .object({
            category_name: z.string(),
            category_id: z.number(),
          })
          .array(),
      }),
    },
  });
  ProjectsGet = new Route({
    method: "get",
    path: "/api/projects",
    schema: {
      ReqQuery: z.object({
        org_id: zodStringReadableAsNumber("Organisasi yang dimasukkan tidak valid!").optional(),
        user_id: zodStringReadableAsNumber("Pengguna yang dimasukkan tidak valid!").optional(),
        keyword: z.string().optional(),
        ...zodPagination(),
      }),
      ResBody: z
        .object({
          org_id: z.number(),
          project_id: z.number(),
          project_archived: z.boolean(),
          project_name: z.string(),
          project_desc: z.string(),
          project_members: z
            .object({
              user_id: z.number(),
              role: z.enum(project_roles).or(z.literal("Not Involved")),
            })
            .array(),
          project_categories: z
            .object({
              category_name: z.string(),
              category_id: z.number(),
            })
            .array(),
        })
        .array(),
    },
    handler: async (req, res) => {
      const { limit, org_id, user_id, keyword, page } = req.query;

      const result = await this.project_service.getProjects({
        org_id: org_id != undefined ? Number(org_id) : undefined,
        user_id: user_id != undefined ? Number(user_id) : undefined,
        limit: limit != undefined ? Number(limit) : undefined,
        page: limit != undefined ? Number(page) : undefined,
        keyword,
      });

      res.status(200).json(result);
    },
  });
  ProjectsDetailGet = new Route({
    method: "get",
    path: "/api/projects/:project_id",
    schema: {
      Params: z.object({
        project_id: zodStringReadableAsNumber("ID projek tidak valid!"),
      }),
      ResBody: z.object({
        org_id: z.number(),
        project_id: z.number(),
        project_name: z.string(),
        project_archived: z.boolean(),
        project_desc: z.string(),
        project_members: z
          .object({
            user_id: z.number(),
            role: z.enum(project_roles).or(z.literal("Not Involved")),
          })
          .array(),
        project_categories: z
          .object({
            category_name: z.string(),
            category_id: z.number(),
          })
          .array(),
      }),
    },
    handler: async (req, res) => {
      const project_id = req.params.project_id;

      const result = await this.project_service.getProjectByID(Number(project_id));
      if (result === undefined) {
        throw new NotFoundError("Projek tidak ditemukan!");
      }
      res.status(200).json(result);
    },
  });

  ProjectsDetailEventsGet = new Route({
    method: "get",
    path: "/api/projects/:project_id/events",
    schema: {
      Params: z.object({
        project_id: zodStringReadableAsNumber("ID projek tidak valid!"),
      }),
      ResBody: z
        .object({
          project_id: z.number(),
          created_at: z.date(),
          id: z.number(),
          event: z.string(),
        })
        .array(),
    },
    handler: async (req, res) => {
      const project_id = req.params.project_id;

      const result = await this.project_service.getEvents(Number(project_id));
      res.status(200).json(result);
    },
  });

  ProjectsDetailPut = new Route({
    method: "put",
    path: "/api/projects/:project_id",
    schema: {
      Params: z.object({
        project_id: zodStringReadableAsNumber("ID projek tidak valid!"),
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
        archive: z.boolean().optional(),
      }),
      ResBody: z.object({
        org_id: z.number(),
        project_id: z.number(),
        project_name: z.string(),
        project_desc: z.string(),
        project_archived: z.boolean(),
        project_members: z
          .object({
            user_id: z.number(),
            role: z.enum(project_roles).or(z.literal("Not Involved")),
          })
          .array(),
        project_categories: z
          .object({
            category_name: z.string(),
            category_id: z.number(),
          })
          .array(),
      }),
    },
    handler: async (req, res) => {
      const project_id = Number(req.params.project_id);
      const obj = req.body;
      const sender_id = req.session.user_id!;

      await this.project_service.updateProject(project_id, obj, sender_id);

      const result = await this.project_service.getProjectByID(project_id);

      res.status(200).json(result);
    },
  });

  ProjectsDetailMembersGet = new Route({
    method: "get",
    path: "/api/projects/:project_id/users/:user_id",
    schema: {
      Params: z.object({
        project_id: zodStringReadableAsNumber("ID projek tidak valid!"),
        user_id: zodStringReadableAsNumber("ID pengguna tidak valid!"),
      }),
      ResBody: z.object({
        role: z.enum(project_roles).or(z.literal("Not Involved")),
      }),
    },
    handler: async (req, res) => {
      const { project_id: project_id_str, user_id: user_id_str } = req.params;
      const project_id = Number(project_id_str);
      const user_id = Number(user_id_str);

      const verify = await this.project_service.getProjectByID(project_id);
      if (verify == undefined) {
        throw new NotFoundError("Proyek tersebut tidak dapat ditemukan!");
      }

      const result = await this.project_service.getMemberRole(project_id, user_id);
      res.status(200).json({ role: result });
    },
  });
  ProjectsDetailMembersPut = new Route({
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
        project_id: zodStringReadableAsNumber("Projek yang dimasukkan tidak valid!"),
        user_id: zodStringReadableAsNumber("Pengguna yang dimasukkan tidak valid!"),
      }),
      ResBody: z.object({
        role: z.enum(project_roles).or(z.literal("Not Involved")),
      }),
    },
    handler: async (req, res) => {
      const { project_id: project_id_str, user_id: user_id_str } = req.params;
      const project_id = Number(project_id_str);
      const user_id = Number(user_id_str);
      const sender_id = req.session.user_id!;
      const role = req.body.role;

      await this.project_service.assignMember(project_id, user_id, sender_id, role);

      const result = await this.project_service.getMemberRole(project_id, user_id);
      res.json({ role: result });
    },
  });
  ProjectsDetailMembersDelete = new Route({
    method: "delete",
    path: "/api/projects/:project_id/users/:user_id",
    schema: {
      Params: z.object({
        project_id: zodStringReadableAsNumber("ID projek tidak valid!"),
        user_id: zodStringReadableAsNumber("ID pengguna tidak valid!"),
      }),
      ResBody: z.object({
        role: z.enum(project_roles).or(z.literal("Not Involved")),
      }),
    },
    handler: async (req, res) => {
      const { project_id: project_id_str, user_id: user_id_str } = req.params;
      const project_id = Number(project_id_str);
      const user_id = Number(user_id_str);
      const sender_id = req.session.user_id!;

      await this.project_service.tryUnassignMember(project_id, user_id, sender_id);

      const result = await this.project_service.getMemberRole(project_id, user_id);
      res.status(200).json({ role: result });
    },
  });

  ProjectsCategoriesGet = new Route({
    method: "get",
    path: "/api/project-categories",
    schema: {
      ResBody: z
        .object({
          category_id: z.number(),
          category_name: z.string(),
        })
        .array(),
    },
    handler: async (req, res) => {
      const result = await this.project_service.getCategories();
      res.status(200).json(result);
    },
  });
}
