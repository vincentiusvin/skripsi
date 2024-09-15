import type { Express } from "express";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller";
import { RH } from "../../helpers/types";
import { ContributionService } from "./ContributionService";

export class ContributionController extends Controller {
  private cont_service: ContributionService;
  constructor(express_server: Express, cont_service: ContributionService) {
    super(express_server);
    this.cont_service = cont_service;
  }

  init() {
    return {
      ContributionsGet: new Route({
        handler: this.contributionGet,
        method: "get",
        path: "/api/contributions",
      }),
      contributionGetDetail: new Route({
        handler: this.contributionGetDetail,
        method: "get",
        path: "/api/contributions/:id",
        schema: {
          Params: z.object({
            id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID kontribusi tidak valid" }),
          }),
        },
      }),

      contributionAdd: new Route({
        handler: this.contributionAdd,
        method: "post",
        path: "/api/contributions",
        schema: {
          ReqBody: z.object({
            contributions_name: z.string().min(1, "Nama kontribusi tidak boleh kosong!"),
            contributions_description: z
              .string()
              .min(1, "Deskripsi kontribusi tidak boleh kosong!"),
            contributions_project_id: z.number().min(1, "Project ID tidak boleh kosong!"),
            user_id: z.array(z.number(), { message: "User Id invalid!" }).min(1),
          }),
        },
      }),

      contributionStatus: new Route({
        handler: this.contributionStatus,
        method: "put",
        path: "/api/contributions/:id",
        schema: {
          ReqBody: z.object({
            contributions_name: z.string().min(1, "Nama kontribusi tidak boleh kosong!").optional(),
            contributions_description: z
              .string()
              .min(1, "Deskripsi kontribusi tidak boleh kosong!")
              .optional(),
            contributions_project_id: z
              .number()
              .min(1, "Project ID tidak boleh kosong!")
              .optional(),
            user_id: z.array(z.number(), { message: "User Id invalid!" }).min(1).optional(),
            status: z.string().min(1, "Status tidak boleh kosong").optional(),
          }),
        },
      }),
    };
  }

  private contributionGet: RH<{
    ResBody: {
      contributions_name: string;
      contributions_description: string;
      contributions_status: string;
      contribution_users: {
        user_id: number;
      }[];
      project_id: number;
      id: number;
    }[];
    ReqQuery: {
      user_id?: string;
      project_id?: string;
    };
  }> = async (req, res) => {
    const { user_id, project_id } = req.query;

    const result = await this.cont_service.getContributions({
      user_id: user_id || undefined ? Number(user_id) : undefined,
      project_id: project_id || undefined ? Number(user_id) : undefined,
    });
    res.status(200).json(result);
  };

  private contributionGetDetail: RH<{
    params: { id: string };
    ResBody: {
      contributions_name: string;
      contributions_description: string;
      contributions_status: string;
      contribution_users: {
        user_id: number;
      }[];
      project_id: number;
      id: number;
    };
  }> = async (req, res) => {
    const id = Number(req.params.id);
    const result = await this.cont_service.getContributionDetail(id);
    res.status(200).json(result);
  };

  private contributionAdd: RH<{
    ResBody: {
      contributions_name: string;
      contributions_description: string;
      contributions_status: string;
      contribution_users: {
        user_id: number;
      }[];
      project_id: number;
      id: number;
    };
    ReqBody: {
      contributions_name: string;
      contributions_description: string;
      contributions_project_id: number;
      user_id: number[];
    };
  }> = async (req, res) => {
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
  };

  private contributionStatus: RH<{
    Params: { id: string };
    ResBody: {
      contributions_name: string;
      contributions_description: string;
      contributions_status: string;
      contribution_users: {
        user_id: number;
      }[];
      project_id: number;
      id: number;
    };
    ReqBody: {
      contributions_name?: string;
      contributions_description?: string;
      contributions_project_id?: number;
      user_id?: number[];
      status?: string;
    };
  }> = async (req, res) => {
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
  };
}
