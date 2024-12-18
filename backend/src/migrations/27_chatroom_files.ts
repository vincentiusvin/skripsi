import { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("chatroom_files")
    .addColumn("id", "serial", (b) => b.primaryKey())
    .addColumn("filename", "text", (b) => b.notNull())
    .addColumn("content", "bytea", (b) => b.notNull())
    .addColumn("message_id", "integer", (build) =>
      build.references("messages.id").onDelete("cascade").onUpdate("cascade").notNull(),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("chatroom_files").execute();
}
