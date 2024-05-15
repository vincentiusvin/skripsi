import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("categories_projects")
    .addColumn("project_id", "integer", (build) =>
      build.references("projects.id").notNull()
    )
    .addColumn("category_id", "integer", (build) =>
      build.references("categories.id").notNull()
    )
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`NOW()`).notNull()
    )
    .addPrimaryKeyConstraint("categories_projects_pk", [
      "project_id",
      "category_id",
    ])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("categories_projects").execute();
}
