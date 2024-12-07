import type { Express } from "express";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller";
import { validateLogged } from "../../helpers/validate.js";
import {
  defaultError,
  zodPagination,
  zodStringReadableAsNumber,
} from "../../helpers/validators.js";
import { contribution_status } from "./ContributionMisc.js";
import { ContributionService } from "./ContributionService";

const ContributionUpdateSchema = z.object({
  name: z.string(defaultError("Judul kontribusi tidak valid!")).min(1).optional(),
  description: z.string(defaultError("Deskripsi kontribusi tidak valid!")).min(1).optional(),
  project_id: z.number(defaultError("Nomor proyek tidak valid!")).min(1).optional(),
  user_ids: z.number(defaultError("Nomor pengguna tidak valid!")).array().min(1).optional(),
  status: z.enum(contribution_status, defaultError("Status tidak valid!")).optional(),
});

const ContributionResponseSchema = z.object({
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
});

const ContributionCreationSchema = z.object({
  name: z.string(defaultError("Judul kontribusi tidak valid!")).min(1),
  description: z.string(defaultError("Deskripsi kontribusi tidak valid!")).min(1),
  project_id: z.number(defaultError("Nomor proyek tidak valid!")).min(1),
  user_ids: z.number(defaultError("Nomor pengguna tidak valid!")).array().min(1),
});

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
        user_id: zodStringReadableAsNumber("Nomor pengguna tidak valid!").optional(),
        project_id: zodStringReadableAsNumber("Nomor proyek tidak valid!").optional(),
        status: z.enum(contribution_status, defaultError("Status tidak valid!")).optional(),
        ...zodPagination(),
      }),
      ResBody: z.object({
        result: ContributionResponseSchema.array(),
        total: z.number(),
      }),
    },
    handler: async (req, res) => {
      const { page, limit, status, user_id, project_id } = req.query;
      const sender_id = req.session.user_id !== undefined ? Number(req.session.user_id) : undefined;

      const params = {
        status: status,
        user_id: user_id != undefined ? Number(user_id) : undefined,
        project_id: project_id != undefined ? Number(project_id) : undefined,
        page: page != undefined ? Number(page) : undefined,
        limit: limit != undefined ? Number(limit) : undefined,
      };

      const result = await this.cont_service.getContributions(params, sender_id);
      const count = await this.cont_service.countContributions(params, sender_id);

      res.status(200).json({ result, total: Number(count.count) });
    },
  });
  ContributionsDetailGet = new Route({
    method: "get",
    path: "/api/contributions/:id",
    schema: {
      Params: z.object({
        id: zodStringReadableAsNumber("Nomor kontribusi tidak valid"),
      }),
      ResBody: ContributionResponseSchema,
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
    priors: [validateLogged],
    schema: {
      ResBody: ContributionResponseSchema,
      ReqBody: ContributionCreationSchema,
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
    priors: [validateLogged],
    schema: {
      ResBody: ContributionResponseSchema,
      Params: z.object({
        id: zodStringReadableAsNumber("ID Kontribusi tidak valid!"),
      }),
      ReqBody: ContributionUpdateSchema,
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
