import { ExpressionBuilder, Kysely } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { DB } from "../../db/db_types.js";
import { ProjectRoles, parseRole } from "./ProjectMisc.js";

function projectWithMembers(eb: ExpressionBuilder<DB, "ms_projects">) {
  return jsonArrayFrom(
    eb
      .selectFrom("projects_users")
      .select(["projects_users.user_id", "projects_users.role"])
      .whereRef("projects_users.project_id", "=", "ms_projects.id")
      .orderBy(["projects_users.role asc", "projects_users.user_id asc"]),
  );
}

function projectWithCategories(eb: ExpressionBuilder<DB, "ms_projects">) {
  return jsonArrayFrom(
    eb
      .selectFrom("categories_projects")
      .innerJoin(
        "ms_category_projects",
        "categories_projects.category_id",
        "ms_category_projects.id",
      )
      .select([
        "ms_category_projects.name as category_name",
        "ms_category_projects.id as category_id",
      ])
      .whereRef("categories_projects.project_id", "=", "ms_projects.id"),
  );
}

export class ProjectRepository {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async getMembers(project_id: number) {
    const raw = await this.db
      .selectFrom("projects_users")
      .select(["projects_users.user_id", "projects_users.role"])
      .where("project_id", "=", project_id)
      .execute();

    return raw.map((x) => ({
      ...x,
      role: parseRole(x.role),
    }));
  }

  async getMemberRole(project_id: number, user_id: number): Promise<ProjectRoles> {
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
      return "Not Involved";
    }

    const ret = parseRole(res.role);
    return ret;
  }

  async assignMember(project_id: number, user_id: number, role: ProjectRoles) {
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
  }

  async unassignMember(project_id: number, user_id: number) {
    await this.db
      .deleteFrom("projects_users")
      .where((eb) =>
        eb.and({
          "projects_users.project_id": project_id,
          "projects_users.user_id": user_id,
        }),
      )
      .execute();
  }

  async getProjects(filter?: { org_id?: number; user_id?: number; keyword?: string }) {
    const { org_id, user_id, keyword } = filter || {};

    let projects = this.db
      .selectFrom("ms_projects")
      .select((eb) => [
        "ms_projects.id as project_id",
        "ms_projects.name as project_name",
        "ms_projects.org_id",
        "ms_projects.description as project_desc",
        projectWithMembers(eb).as("project_members"),
        projectWithCategories(eb).as("project_categories"),
      ]);

    if (org_id != undefined) {
      projects = projects.where("org_id", "=", Number(org_id));
    }

    if (user_id != undefined) {
      projects = projects.where((eb) =>
        eb(
          "ms_projects.id",
          "in",
          eb
            .selectFrom("projects_users")
            .select("projects_users.project_id")
            .where("projects_users.user_id", "=", Number(user_id)),
        ),
      );
    }

    if (keyword != undefined) {
      projects = projects.where("ms_projects.name", "ilike", `%${keyword}%`);
    }

    return await projects.execute();
  }

  async getProjectByID(project_id: number) {
    return await this.db
      .selectFrom("ms_projects")
      .select((eb) => [
        "ms_projects.id as project_id",
        "ms_projects.name as project_name",
        "ms_projects.org_id",
        "ms_projects.description as project_desc",
        projectWithMembers(eb).as("project_members"),
        projectWithCategories(eb).as("project_categories"),
      ])
      .where("ms_projects.id", "=", project_id)
      .executeTakeFirst();
  }

  async addProject(obj: {
    project_name: string;
    org_id: number;
    project_desc: string;
    category_id?: number[];
  }) {
    const { project_name, org_id, project_desc, category_id } = obj;

    return await this.db.transaction().execute(async (trx) => {
      const prj = await trx
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

      for (const cat_id of category_id ?? []) {
        await trx
          .insertInto("categories_projects")
          .values({
            project_id: prj.id,
            category_id: cat_id,
          })
          .execute();
      }
      return prj.id;
    });
  }

  async getCategories() {
    return await this.db
      .selectFrom("ms_category_projects")
      .select(["id as category_id", "name as category_name"])
      .execute();
  }

  async getProjectBuckets(project_id: number) {
    return await this.db
      .selectFrom("ms_task_buckets")
      .select(["name", "id"])
      .where("ms_task_buckets.project_id", "=", project_id)
      .execute();
  }

  async addBucket(project_id: number, name: string) {
    return this.db
      .insertInto("ms_task_buckets")
      .values({
        name: name,
        project_id: Number(project_id),
      })
      .execute();
  }
}
