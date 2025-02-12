import { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("chatroom_files")
    .addColumn("filetype", "text", (b) => b.notNull().defaultTo("application/octet-stream"))
    .execute();

  await db.schema
    .alterTable("chatroom_files")
    .alterColumn("filetype", (b) => b.dropDefault())
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.alterTable("chatroom_files").dropColumn("filetype").execute();
}
