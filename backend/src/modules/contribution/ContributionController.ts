import type { Express } from "express";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller";
import { zodStringReadableAsNumber } from "../../helpers/validators.js";
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
      }),
      ResBody: z
        .object({
          contributions_name: z.string(),
          contributions_description: z.string(),
          contributions_status: z.string(),
          project_id: z.number(),
          id: z.number(),
          contribution_users: z.array(
            z.object({
              user_id: z.number(),
            }),
          ),
        })
        .array(),
    },
    handler: async (req, res) => {
      const { user_id, project_id } = req.query;

      const result = await this.cont_service.getContributions({
        user_id: user_id || undefined ? Number(user_id) : undefined,
        project_id: project_id || undefined ? Number(user_id) : undefined,
      });
      res.status(200).json(result);
    },
  });
  ContributionsDetailGet = new Route({
    method: "get",
    path: "/api/contributions/:id",
    schema: {
      Params: z.object({
        id: z
          .string()
          .min(1)
          .refine((arg) => !isNaN(Number(arg)), { message: "ID kontribusi tidak valid" }),
      }),
      ResBody: z.object({
        contributions_name: z.string(),
        contributions_description: z.string(),
        contributions_status: z.string(),
        project_id: z.number(),
        id: z.number(),
        contribution_users: z.array(
          z.object({
            user_id: z.number(),
          }),
        ),
      }),
    },
    handler: async (req, res) => {
      const id = Number(req.params.id);
      const result = await this.cont_service.getContributionDetail(id);
      res.status(200).json(result);
    },
  });
  ContributionsPost = new Route({
    method: "post",
    path: "/api/contributions",
    schema: {
      ResBody: z.object({
        contributions_name: z.string(),
        contributions_description: z.string(),
        contributions_status: z.string(),
        project_id: z.number(),
        id: z.number(),
        contribution_users: z.array(
          z.object({
            user_id: z.number(),
          }),
        ),
      }),
      ReqBody: z.object({
        contributions_name: z.string().min(1, "Nama kontribusi tidak boleh kosong!"),
        contributions_description: z.string().min(1, "Deskripsi kontribusi tidak boleh kosong!"),
        contributions_project_id: z.number().min(1, "Project ID tidak boleh kosong!"),
        user_id: z.array(z.number(), { message: "User Id invalid!" }).min(1),
      }),
    },
    handler: async (req, res) => {
      const { contributions_name, contributions_description, contributions_project_id, user_id } =
        req.body;

      const result = await this.cont_service.addContributions(
        {
          contributions_name,
          contributions_description,
          contributions_project_id,
        },
        user_id,
      );

      const resultFinal = await this.cont_service.getContributionDetail(result.id);
      res.status(201).json(resultFinal);
    },
  });
  ContributionsDetailPut = new Route({
    method: "put",
    path: "/api/contributions/:id",
    schema: {
      ResBody: z.object({
        contributions_name: z.string(),
        contributions_description: z.string(),
        contributions_status: z.string(),
        project_id: z.number(),
        id: z.number(),
        contribution_users: z.array(
          z.object({
            user_id: z.number(),
          }),
        ),
      }),
      Params: z.object({
        id: zodStringReadableAsNumber("ID Kontribusi tidak valid!"),
      }),
      ReqBody: z.object({
        contributions_name: z.string().min(1, "Nama kontribusi tidak boleh kosong!").optional(),
        contributions_description: z
          .string()
          .min(1, "Deskripsi kontribusi tidak boleh kosong!")
          .optional(),
        contributions_project_id: z.number().min(1, "Project ID tidak boleh kosong!").optional(),
        user_id: z.array(z.number(), { message: "User Id invalid!" }).min(1).optional(),
        status: z.string().min(1, "Status tidak boleh kosong").optional(),
      }),
    },
    handler: async (req, res) => {
      const id = Number(req.params.id);
      const {
        contributions_name,
        contributions_description,
        contributions_project_id,
        user_id,
        status,
      } = req.body;
      await this.cont_service.statusContributions(id, {
        contributions_name,
        contributions_description,
        contributions_project_id,
        user_id,
        status,
      });
      const result = await this.cont_service.getContributionDetail(id);
      res.status(200).json(result);
    },
  });
}
