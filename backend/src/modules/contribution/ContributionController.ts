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
        path: "/api/contribution/:id",
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
        path: "/api/contribution",
        schema: {
          ReqBody: z.object({
            cont_name: z.string().min(1, "Nama kontribusi tidak boleh kosong!"),
            cont_description: z.string().min(1, "Deskripsi kontribusi tidak boleh kosong!"),
            cont_project_id: z.number().min(1, "Project ID tidak boleh kosong!"),
            user_id: z.number().min(1, "User id tidak boleh kosong!"),
          }),
        },
      }),

      contributionStatus: new Route({
        handler: this.contributionStatus,
        method: "put",
        path: "/api/contribution/:id/status",
        schema: {
          ReqBody: z.object({
            status: z.string().min(1, "Status tidak boleh kosong"),
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
    ResBody: { contribution_id: number };
    ReqBody: {
      cont_name: string;
      cont_description: string;
      cont_project_id: number;
      user_id: number;
    };
  }> = async (req, res) => {
    const { cont_name, cont_description, cont_project_id, user_id } = req.body;

    if (user_id == undefined) {
      throw new Error("Gagal menambahkan kontribusi!");
    }

    const result = await this.cont_service.addContributions(
      {
        cont_name,
        cont_description,
        cont_project_id,
      },
      user_id,
    );

    const response = { contribution_id: result.id };

    res.status(201).json(response);
  };

  private contributionStatus: RH<{
    Params: { id: string };
    ResBody: { status: string };
    ReqBody: {
      status: string;
    };
  }> = async (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;
    if (id == undefined) {
      throw new Error("Gagal Approve kontribusi");
    }
    await this.cont_service.statusContributions(id, status);
    res.status(200).json({ status: status });
  };
}
