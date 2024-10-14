import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("ms_project_events")
    .addColumn("id", "serial", (eb) => eb.primaryKey())
    .addColumn("project_id", "integer", (build) =>
      build.references("ms_projects.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("event", "text", (eb) => eb.notNull())
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`).notNull())
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("ms_project_events").execute();
}
