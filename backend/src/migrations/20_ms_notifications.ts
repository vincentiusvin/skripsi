import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("ms_notifications")
    .addColumn("id", "serial", (build) => build.primaryKey())
    .addColumn("user_id", "integer", (build) =>
      build.references("ms_users.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("type", "text", (col) => col.notNull())
    .addColumn("type_id", "integer")
    .addColumn("read", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`).notNull())
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("ms_notifications").execute();
}
