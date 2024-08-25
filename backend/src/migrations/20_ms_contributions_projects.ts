import { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("ms_contributions_projects")
    .addColumn("project_id", "serial", (build) =>
      build.references("ms_projects.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("contributions_id", "integer", (build) =>
      build.references("ms_contributions.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .execute();
}
