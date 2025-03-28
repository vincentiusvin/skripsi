import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("orgs")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull().unique())
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("phone", "text", (col) => col.notNull())
    .addColumn("address", "text", (col) => col.notNull())
    .addColumn("image", "text")
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`).notNull())
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("orgs").execute();
}
