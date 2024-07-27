import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("ms_tasks")
    .addColumn("id", "serial", (build) => build.primaryKey())
    .addColumn("name", "text", (build) => build.notNull())
    .addColumn("bucket_id", "integer", (build) =>
      build.references("ms_task_buckets.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("order", "integer", (build) => build.notNull())
    .addColumn("description", "text")
    .addColumn("start_at", "timestamp")
    .addColumn("end_at", "timestamp")
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`).notNull())
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("ms_tasks").execute();
}
