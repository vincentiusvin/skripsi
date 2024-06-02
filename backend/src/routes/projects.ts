import { ExpressionBuilder, Kysely } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { Application } from "../app.js";
import { DB } from "../db/db_types";
import { AuthError, ClientError, NotFoundError } from "../helpers/error";
import { RH, RHTop } from "../helpers/types";
import { Controller, Route } from "./controller.js";

const project_roles = ["Pending", "Dev", "Admin"] as const;
export type ProjectRoles = (typeof project_roles)[number];

export function parseRole(role: string) {
  return project_roles.find((x) => x === role);
}

export function withMembers(eb: ExpressionBuilder<DB, "ms_projects">) {
  return jsonArrayFrom(
    eb
      .selectFrom("projects_users")
      .innerJoin("ms_users", "ms_users.id", "projects_users.user_id")
      .select(["ms_users.id", "ms_users.name", "projects_users.role"])
      .whereRef("projects_users.project_id", "=", "ms_projects.id"),
  );
}

export class ProjectController extends Controller {
  private db: Kysely<DB>;
  constructor(app: Application) {
    super(app);
    this.db = app.db;
  }

  protected init(): Record<string, Route<RHTop>> {
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
        handler: this.postProjects,
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
        method: "get",
        path: "/api/projects/:project_id/users/:user_id",
      }),
      ProjectsDetailMembersDelete: new Route({
        handler: this.deleteProjectsDetailMembersDetail,
        method: "get",
        path: "/api/projects/:project_id/users/:user_id",
      }),
      ProjectsCategoriesGet: new Route({
        handler: this.getProjectsCategories,
        method: "get",
        path: "/api/project-categories",
      }),
    };
  }

  getProjectsDetailMembersDetail: RH<{
    ResBody: {
      role: "Admin" | "Dev" | "Pending";
    };
    Params: {
      project_id: string;
      user_id: string;
    };
  }> = async (req, res) => {
    const { project_id: project_id_str, user_id: user_id_str } = req.params;
    const project_id = Number(project_id_str);
    const user_id = Number(user_id_str);

    const result = await this.getProjectRole(user_id, project_id);
    if (!result) {
      throw new NotFoundError("User tidak terdaftar dalam projek!");
    } else {
      res.json({ role: result });
    }
  };

  // Kalau sender admin, kita turutin apapun maunya.
  // Selain itu cuma boleh ngurusin dirinya sendiri (user_id dia doang) DAN cuma boleh role "Pending".
  // Kalau orang organisasi, langsung kita naikin ke "Admin".
  // Kalau bukan, kita jadiin "Pending"
  putProjectsDetailMembersDetail: RH<{
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
    let role = req.body.role;

    const sender_role = await this.getProjectRole(sender_id, project_id);
    const project = await this.db
      .selectFrom("ms_projects")
      .where("id", "=", project_id)
      .select("ms_projects.org_id")
      .executeTakeFirst();
    if (!project) {
      throw new NotFoundError("Tidak ditemukan");
    }

    let allowed = false;
    if (sender_role === "Admin") {
      allowed = true;
    } else if (sender_id === user_id && role === "Pending") {
      const member = await this.db
        .selectFrom("orgs_users")
        .select("user_id")
        .where((eb) =>
          eb.and({
            "orgs_users.user_id": user_id,
            "orgs_users.org_id": project.org_id,
          }),
        )
        .executeTakeFirst();

      const is_org_member = member ? member.user_id === user_id : false;

      if (is_org_member) {
        allowed = true;
        role = "Admin"; // Langsung promote
      } else {
        allowed = true;
      }
    }

    if (!allowed) {
      throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
    }

    await this.db
      .insertInto("projects_users")
      .values({
        project_id: project_id,
        user_id: user_id,
        role: role,
      })
      .onConflict((oc) =>
        oc.columns(["user_id", "project_id"]).doUpdateSet({
          role: role,
        }),
      )
      .execute();
    res.json({ role: role });
  };

  deleteProjectsDetailMembersDetail: RH<{
    ResBody: {
      msg: string;
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

    const sender_role = await this.getProjectRole(sender_id, project_id);

    let allowed = false;
    if (sender_role === "Admin") {
      allowed = true;
    } else if (sender_id === user_id) {
      allowed = true;
    }

    if (!allowed) {
      throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
    }

    await this.db
      .deleteFrom("projects_users")
      .where((eb) =>
        eb.and({
          "projects_users.project_id": project_id,
          "projects_users.user_id": user_id,
        }),
      )
      .execute();

    res.status(200).json({ msg: "Pengguna berhasil dihapus dari projek!" });
  };

  getProjects: RH<{
    ResBody: {
      project_id: number;
      project_name: string;
      org_id: number;
    }[];
    ReqQuery: {
      org_id: string;
    };
  }> = async (req, res) => {
    const id = req.query.org_id;
    let projects = this.db
      .selectFrom("ms_projects")
      .select(["id as project_id", "name as project_name", "org_id"]);
    if (id != undefined) {
      projects = projects.where("org_id", "=", Number(id));
    }
    const result = await projects.execute();

    res.status(200).json(result);
  };

  getProjectsDetail: RH<{
    ReqParams: { id: number };
    ResBody: {
      project_id: number;
      project_name: string;
      org_id: number;
      project_desc: string;
      project_members: {
        id: number;
        name: string;
        role: ProjectRoles;
      }[];
      project_categories: string[];
    };
    Params: {
      project_id: number;
    };
  }> = async (req, res) => {
    const id = req.params.project_id;
    const project = await this.db
      .selectFrom("ms_projects")
      .select((eb) => [
        "ms_projects.id as project_id",
        "ms_projects.name as project_name",
        "ms_projects.org_id",
        "ms_projects.description as project_desc",
        withMembers(eb).as("project_members"),
        jsonArrayFrom(
          eb
            .selectFrom("categories_projects")
            .innerJoin(
              "ms_category_projects",
              "categories_projects.category_id",
              "ms_category_projects.id",
            )
            .select(["ms_category_projects.name as category_name"])
            .whereRef("categories_projects.project_id", "=", "ms_projects.id"),
        ).as("project_categories"),
      ])
      .where("ms_projects.id", "=", id)
      .executeTakeFirst();

    if (!project) {
      throw new NotFoundError("Project yang dicari tidak dapat ditemukan!");
    }

    // Extract category names from the project object
    const projectCategories = project.project_categories.map(
      (category: { category_name: string }) => category.category_name,
    );

    // Return modified project object with project_categories
    const modifiedProject = {
      ...project,
      project_members: project.project_members.map((x) => {
        const role = parseRole(x.role);
        if (!role) {
          throw new Error("Role user tidak diketahui!");
        }
        return { ...x, role };
      }),
      project_categories: projectCategories,
    };

    res.status(200).json(modifiedProject);
  };

  postProjects: RH<{
    ReqBody: {
      project_name: string;
      org_id: number;
      project_desc: string;
      category_id: number;
    };
    ResBody: {
      msg: string;
    };
  }> = async (req, res) => {
    const { project_name, org_id, project_desc, category_id } = req.body;
    //validasi
    if (project_name.length === 0) {
      throw new ClientError("Nama tidak boleh kosong");
    }
    if (project_desc.length == 0) {
      throw new ClientError("Deskripsi tidak boleh kosong");
    }

    if (!category_id) throw new ClientError("Kategori tidak boleh kosong!");

    const prj = await this.db
      .insertInto("ms_projects")
      .values({
        description: project_desc,
        name: project_name,
        org_id,
      })
      .returning("id")
      .executeTakeFirst();

    if (!prj) {
      throw new Error("Failed to insert project");
    }
    // Insert project_id and category_id into ms_category_project table
    await this.db
      .insertInto("categories_projects")
      .values({
        project_id: prj.id,
        category_id: category_id,
      })
      .execute();

    res.status(200).json({
      msg: "insert successfull",
    });
  };

  getProjectsCategories: RH<{
    ResBody: {
      id: number;
      name: string;
    }[];
  }> = async (req, res) => {
    const category = await this.db
      .selectFrom("ms_category_projects")
      .select(["id", "name"])
      .execute();

    res.status(200).json(category);
  };

  async getProjectRole(user_id: number, project_id: number): Promise<ProjectRoles | undefined> {
    const res = await this.db
      .selectFrom("projects_users")
      .select("role")
      .where((eb) =>
        eb.and({
          "projects_users.user_id": user_id,
          "projects_users.project_id": project_id,
        }),
      )
      .executeTakeFirst();

    if (!res) {
      return undefined;
    }

    const ret = parseRole(res.role);
    if (!ret) {
      throw new Error("Role user tidak diketahui!");
    }
    return ret;
  }
}
