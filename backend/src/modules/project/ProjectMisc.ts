import { ExpressionBuilder } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { DB } from "../../db/db_types.js";

const project_roles = ["Pending", "Dev", "Admin", "Not Involved"] as const;
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
      .whereRef("projects_users.project_id", "=", "ms_projects.id")
      .orderBy(["projects_users.role asc", "ms_users.name asc"]),
  );
}
