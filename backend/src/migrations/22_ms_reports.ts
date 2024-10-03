import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("ms_reports")
    .addColumn("id", "serial", (build) => build.primaryKey())
    .addColumn("sender_id", "integer", (build) =>
      build.references("ms_users.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("chatroom_id", "integer", (build) =>
      build.references("ms_chatrooms.id").onDelete("set null").onUpdate("cascade"),
    )
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("status", "text", (col) => col.notNull())
    .addColumn("resolution", "text")
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`).notNull())
    .addColumn("resolved_at", "timestamp")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("ms_reports").execute();
}
