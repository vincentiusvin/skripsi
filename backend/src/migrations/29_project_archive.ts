import { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("ms_projects")
    .addColumn("archived", "boolean", (eb) => eb.notNull().defaultTo(false))
    .addColumn("content", "text")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.alterTable("ms_projects").dropColumn("archived").dropColumn("content").execute();
}
