import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("ms_messages")
    .addColumn("id", "serial", (build) => build.primaryKey())
    .addColumn("message", "text", (build) => build.notNull())
    .addColumn("users_id", "integer", (build) => build.references("ms_users.id").notNull())
    .addColumn("chatroom_id", "integer", (build) => build.references("ms_chatrooms.id").notNull())
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`).notNull())
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("ms_messages").execute();
}
