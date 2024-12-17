import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("suspensions")
    .addColumn("id", "serial", (build) => build.primaryKey())
    .addColumn("user_id", "integer", (build) =>
      build.references("users.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("reason", "text", (col) => col.notNull())
    .addColumn("suspended_until", "timestamp", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`).notNull())
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("suspensions").execute();
}
