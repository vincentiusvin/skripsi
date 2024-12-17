import { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("preferences")
    .addColumn("id", "serial", (b) => b.primaryKey())
    .addColumn("name", "text", (b) => b.unique().notNull())
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("preferences").execute();
}
