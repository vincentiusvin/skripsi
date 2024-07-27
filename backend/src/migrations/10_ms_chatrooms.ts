import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("ms_chatrooms")
    .addColumn("id", "serial", (build) => build.primaryKey())
    .addColumn("name", "text", (build) => build.notNull())
    .addColumn("project_id", "integer", (build) =>
      build.references("ms_projects.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`).notNull())
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("ms_chatrooms").execute();
}
