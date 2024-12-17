import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("projects")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("org_id", "integer", (col) =>
      col.references("orgs.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`).notNull())
    .addColumn("archived", "boolean", (eb) => eb.notNull().defaultTo(false))
    .addColumn("content", "text")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("projects").execute();
}
