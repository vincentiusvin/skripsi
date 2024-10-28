import type { Express } from "express";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller";
import { zodPagination, zodStringReadableAsNumber } from "../../helpers/validators.js";
import { contribution_status } from "./ContributionMisc.js";
import { ContributionService } from "./ContributionService";

export class ContributionController extends Controller {
  private cont_service: ContributionService;
  constructor(express_server: Express, cont_service: ContributionService) {
    super(express_server);
    this.cont_service = cont_service;
  }

  init() {
    return {
      ContributionsGet: this.ContributionsGet,
      ContributionsDetailGet: this.ContributionsDetailGet,
      ContributionsPost: this.ContributionsPost,
      ContributionsDetailPut: this.ContributionsDetailPut,
    };
  }

  ContributionsGet = new Route({
    method: "get",
    path: "/api/contributions",
    schema: {
      ReqQuery: z.object({
        user_id: zodStringReadableAsNumber("ID pengguna tidak valid!").optional(),
        project_id: zodStringReadableAsNumber("ID proyek tidak valid!").optional(),
        status: z.enum(contribution_status).optional(),
        ...zodPagination(),
      }),
      ResBody: z
        .object({
          name: z.string(),
          created_at: z.date(),
          description: z.string(),
          status: z.enum(contribution_status),
          project_id: z.number(),
          id: z.number(),
          user_ids: z.array(
            z.object({
              user_id: z.number(),
            }),
          ),
        })
        .array(),
    },
    handler: async (req, res) => {
      const { page, limit, status, user_id, project_id } = req.query;
      const sender_id = Number(req.session.user_id);

      const result = await this.cont_service.getContributions(
        {
          status: status,
          user_id: user_id != undefined ? Number(user_id) : undefined,
          project_id: project_id != undefined ? Number(project_id) : undefined,
          page: page != undefined ? Number(page) : undefined,
          limit: limit != undefined ? Number(limit) : undefined,
        },
        sender_id,
      );
      res.status(200).json(result);
    },
  });
  ContributionsDetailGet = new Route({
    method: "get",
    path: "/api/contributions/:id",
    schema: {
      Params: z.object({
        id: zodStringReadableAsNumber("ID kontribusi tidak valid"),
      }),
      ResBody: z.object({
        name: z.string(),
        description: z.string(),
        created_at: z.date(),
        status: z.enum(contribution_status),
        project_id: z.number(),
        id: z.number(),
        user_ids: z.array(
          z.object({
            user_id: z.number(),
          }),
        ),
      }),
    },
    handler: async (req, res) => {
      const id = Number(req.params.id);
      const sender_id = Number(req.session.user_id);

      const result = await this.cont_service.getContributionDetail(id, sender_id);
      res.status(200).json(result);
    },
  });
  ContributionsPost = new Route({
    method: "post",
    path: "/api/contributions",
    schema: {
      ResBody: z.object({
        name: z.string(),
        description: z.string(),
        created_at: z.date(),
        status: z.string(),
        project_id: z.number(),
        id: z.number(),
        user_ids: z.array(
          z.object({
            user_id: z.number(),
          }),
        ),
      }),
      ReqBody: z.object({
        name: z.string().min(1, "Nama kontribusi tidak boleh kosong!"),
        description: z.string().min(1, "Deskripsi kontribusi tidak boleh kosong!"),
        project_id: z.number().min(1, "Project ID tidak boleh kosong!"),
        user_ids: z.array(z.number(), { message: "User Id invalid!" }).min(1),
      }),
    },
    handler: async (req, res) => {
      const { name, description, project_id, user_ids } = req.body;
      const sender_id = Number(req.session.user_id);

      const result = await this.cont_service.addContributions(
        {
          name: name,
          description: description,
          project_id: project_id,
        },
        user_ids,
        sender_id,
      );

      const resultFinal = await this.cont_service.getContributionDetail(result.id, sender_id);
      res.status(201).json(resultFinal);
    },
  });
  ContributionsDetailPut = new Route({
    method: "put",
    path: "/api/contributions/:id",
    schema: {
      ResBody: z.object({
        name: z.string(),
        description: z.string(),
        status: z.enum(contribution_status),
        project_id: z.number(),
        created_at: z.date(),
        id: z.number(),
        user_ids: z.array(
          z.object({
            user_id: z.number(),
          }),
        ),
      }),
      Params: z.object({
        id: zodStringReadableAsNumber("ID Kontribusi tidak valid!"),
      }),
      ReqBody: z.object({
        name: z.string().min(1, "Nama kontribusi tidak boleh kosong!").optional(),
        description: z.string().min(1, "Deskripsi kontribusi tidak boleh kosong!").optional(),
        project_id: z.number().min(1, "Project ID tidak boleh kosong!").optional(),
        user_ids: z.array(z.number(), { message: "User Id invalid!" }).min(1).optional(),
        status: z.enum(contribution_status).optional(),
      }),
    },
    handler: async (req, res) => {
      const id = Number(req.params.id);
      const { name, description, project_id, user_ids, status } = req.body;
      const sender_id = Number(req.session.user_id);

      await this.cont_service.updateContribution(
        id,
        {
          name,
          description,
          project_id,
          user_ids,
          status,
        },
        sender_id,
      );
      const result = await this.cont_service.getContributionDetail(id, sender_id);
      res.status(200).json(result);
    },
  });
}
