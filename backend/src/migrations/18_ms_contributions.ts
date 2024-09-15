import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("ms_contributions")
    .addColumn("id", "serial", (build) => build.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("project_id", "integer", (build) =>
      build.references("ms_projects.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("status", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`).notNull())
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("ms_contributions").execute();
}
