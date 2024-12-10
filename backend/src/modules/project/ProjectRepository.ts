import { ExpressionBuilder, Kysely, RawBuilder, SelectQueryBuilder } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { DB } from "../../db/db_types.js";
import { paginateQuery } from "../../helpers/pagination.js";
import { ProjectRoles, parseRole } from "./ProjectMisc.js";

const defaultProjectFields = [
  "ms_projects.id as project_id",
  "ms_projects.name as project_name",
  "ms_projects.org_id",
  "ms_projects.description as project_desc",
  "ms_projects.archived as project_archived",
  "ms_projects.content as project_content",
] as const;

const defaultProjectEventFields = ["id", "project_id", "event", "created_at"] as const;

function projectWithMembers(eb: ExpressionBuilder<DB, "ms_projects">) {
  return jsonArrayFrom(
    eb
      .selectFrom("projects_users")
      .select(["projects_users.user_id", "projects_users.role"])
      .whereRef("projects_users.project_id", "=", "ms_projects.id")
      .orderBy(["projects_users.role asc", "projects_users.user_id asc"]),
  ) as RawBuilder<
    {
      user_id: number;
      role: ProjectRoles;
    }[]
  >;
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

  applyFilterToQuery<O>(
    query: SelectQueryBuilder<DB, "ms_projects", O>,
    filter?: {
      org_id?: number;
      user_id?: number;
      keyword?: string;
    },
  ) {
    const { org_id, user_id, keyword } = filter || {};

    if (org_id != undefined) {
      query = query.where("org_id", "=", Number(org_id));
    }

    if (user_id != undefined) {
      query = query.where((eb) =>
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
      query = query.where((eb) =>
        eb.or([
          eb("ms_projects.name", "ilike", `%${keyword}%`),
          eb(
            "ms_projects.id",
            "in",
            eb
              .selectFrom("ms_category_projects")
              .innerJoin(
                "categories_projects",
                "ms_category_projects.id",
                "categories_projects.category_id",
              )
              .select("categories_projects.project_id")
              .where("ms_category_projects.name", "ilike", `%${keyword}%`),
          ),
        ]),
      );
    }

    return query;
  }

  async countProjects(filter?: { org_id?: number; user_id?: number; keyword?: string }) {
    let query = this.db.selectFrom("ms_projects").select((eb) => eb.fn.countAll().as("count"));
    query = this.applyFilterToQuery(query, filter);

    return await query.executeTakeFirstOrThrow();
  }

  async getProjects(filter?: {
    limit?: number;
    org_id?: number;
    user_id?: number;
    keyword?: string;
    page?: number;
  }) {
    const { page, limit } = filter ?? {};

    let query = this.db
      .selectFrom("ms_projects")
      .select((eb) => [
        ...defaultProjectFields,
        projectWithMembers(eb).as("project_members"),
        projectWithCategories(eb).as("project_categories"),
      ])
      .orderBy("created_at desc");

    query = this.applyFilterToQuery(query, filter);

    query = paginateQuery(query, {
      page,
      limit,
    });

    return query.execute();
  }

  async getProjectByID(project_id: number) {
    return await this.db
      .selectFrom("ms_projects")
      .select((eb) => [
        ...defaultProjectFields,
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
    project_content?: string;
  }) {
    const { project_name, org_id, project_desc, category_id, project_content } = obj;

    const prj = await this.db
      .insertInto("ms_projects")
      .values({
        description: project_desc,
        name: project_name,
        content: project_content,
        org_id,
      })
      .returning("id")
      .executeTakeFirst();

    if (prj == undefined) {
      throw new Error("Failed to insert project");
    }

    if (category_id && category_id.length) {
      await this.db
        .insertInto("categories_projects")
        .values(
          category_id.map((cat_id) => ({
            project_id: prj.id,
            category_id: cat_id,
          })),
        )
        .execute();
    }
    return prj.id;
  }

  async updateProject(
    project_id: number,
    obj: {
      project_name?: string;
      project_desc?: string;
      category_id?: number[];
      project_archived?: boolean;
      project_content?: string | null;
    },
  ) {
    const { project_content, project_archived, project_name, project_desc, category_id } = obj;

    if (
      project_content != undefined ||
      project_name != undefined ||
      project_desc != undefined ||
      project_archived != undefined
    ) {
      await this.db
        .updateTable("ms_projects")
        .set({
          description: project_desc,
          name: project_name,
          archived: project_archived,
          content: project_content,
        })
        .where("ms_projects.id", "=", project_id)
        .executeTakeFirst();
    }

    if (category_id) {
      await this.db
        .deleteFrom("categories_projects")
        .where("project_id", "=", project_id)
        .execute();

      if (category_id.length) {
        await this.db
          .insertInto("categories_projects")
          .values(
            category_id.map((cat_id) => ({
              project_id,
              category_id: cat_id,
            })),
          )
          .execute();
      }
    }
  }

  async deleteProject(project_id: number) {
    return await this.db
      .deleteFrom("ms_projects")
      .where("ms_projects.id", "=", project_id)
      .execute();
  }

  async getCategories() {
    return await this.db
      .selectFrom("ms_category_projects")
      .select(["id as category_id", "name as category_name"])
      .execute();
  }

  async getEvents(project_id: number) {
    return await this.db
      .selectFrom("ms_project_events")
      .select(defaultProjectEventFields)
      .where("project_id", "=", project_id)
      .execute();
  }

  async addEvent(project_id: number, event: string) {
    return await this.db
      .insertInto("ms_project_events")
      .values({
        project_id,
        event,
      })
      .execute();
  }
}
