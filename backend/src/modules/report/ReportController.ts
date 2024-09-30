import type { Express } from "express";
import { Controller, Route } from "../../helpers/controller.js";
import { RH } from "../../helpers/types.js";
import { ReportService } from "./ReportService.js";

export class ReportController extends Controller {
  private report_service: ReportService;
  constructor(express_server: Express, report_service: ReportService) {
    super(express_server);
    this.report_service = report_service;
  }

  init() {
    return {
      ReportsGet: new Route({
        handler: this.getReports,
        method: "get",
        path: "/api/reports",
      }),
    };
  }

  private getReports: RH<{
    ResBody: {
      id: number;
      sender_id: number;
      title: string;
      description: string;
      status: string;
      created_at: Date;
      resolved_at: Date | null;
    }[];
  }> = async (req, res) => {
    const result = await this.report_service.getReports();

    res.status(200).json(result);
  };
}
