import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("ms_orgs_events")
    .addColumn("id", "serial", (eb) => eb.primaryKey())
    .addColumn("org_id", "integer", (build) =>
      build.references("ms_orgs.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("event", "text", (eb) => eb.notNull())
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`).notNull())
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("ms_orgs_events").execute();
}
