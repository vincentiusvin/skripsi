import { Application } from "../../app.js";
import { Controller, Route } from "../../helpers/controller.js";
import { RH } from "../../helpers/types.js";
import { OrgRepository } from "../organization/OrgRepository.js";
import { OrgService } from "../organization/OrgService.js";
import { ProjectRoles } from "./ProjectMisc.js";
import { ProjectRepository } from "./ProjectRepository.js";
import { ProjectService } from "./ProjectService.js";

export class ProjectController extends Controller {
  project_service: ProjectService;
  constructor(app: Application) {
    super(app);
    const repo = new ProjectRepository(app.db);
    const org_serv = new OrgService(new OrgRepository(app.db));
    this.project_service = new ProjectService(repo, org_serv);
  }

  init() {
    return {
      ProjectsPost: new Route({
        handler: this.postProjects,
        method: "post",
        path: "/api/projects",
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
      }),
      ProjectsDetailMembersGet: new Route({
        handler: this.getProjectsDetailMembersDetail,
        method: "get",
        path: "/api/projects/:project_id/users/:user_id",
      }),
      ProjectsDetailMembersPut: new Route({
        handler: this.putProjectsDetailMembersDetail,
        method: "put",
        path: "/api/projects/:project_id/users/:user_id",
      }),
      ProjectsDetailMembersDelete: new Route({
        handler: this.deleteProjectsDetailMembersDetail,
        method: "delete",
        path: "/api/projects/:project_id/users/:user_id",
      }),
      ProjectsDetailBucketsGet: new Route({
        handler: this.getProjectsDetailBuckets,
        method: "get",
        path: "/api/projects/:project_id/buckets",
      }),
      ProjectsDetailBucketsPost: new Route({
        handler: this.postProjectsDetailBuckets,
        method: "post",
        path: "/api/projects/:project_id/buckets",
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
      org_id: Number(org_id),
      user_id: Number(user_id),
      keyword,
    });

    res.status(200).json(result);
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
