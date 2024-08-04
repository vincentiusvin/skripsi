import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("categories_projects")
    .addColumn("project_id", "integer", (build) =>
      build.references("ms_projects.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("category_id", "integer", (build) =>
      build.references("ms_category_projects.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`).notNull())
    .addPrimaryKeyConstraint("categories_projects_pk", ["project_id", "category_id"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("categories_projects").execute();
}
