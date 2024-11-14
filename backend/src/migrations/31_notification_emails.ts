import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("notification_emails")
    .addColumn("id", "serial", (build) => build.primaryKey())
    .addColumn("user_id", "integer", (build) =>
      build.references("ms_users.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("type", "text", (eb) => eb.notNull())
    .addColumn("status", "text", (eb) => eb.notNull())
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`).notNull())
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("notification_emails").execute();
}
