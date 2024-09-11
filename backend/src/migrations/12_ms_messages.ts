import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("ms_messages")
    .addColumn("id", "serial", (build) => build.primaryKey())
    .addColumn("message", "text", (build) => build.notNull())
    .addColumn("is_edited", "boolean", (build) => build.notNull().defaultTo(false))
    .addColumn("user_id", "integer", (build) =>
      build.references("ms_users.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("chatroom_id", "integer", (build) =>
      build.references("ms_chatrooms.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`).notNull())
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("ms_messages").execute();
}
