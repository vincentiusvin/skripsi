import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("ms_task_buckets")
    .addColumn("id", "serial", (build) => build.primaryKey())
    .addColumn("project_id", "integer", (build) => build.references("ms_projects.id").notNull())
    .addColumn("name", "text", (build) => build.notNull())
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`).notNull())
    .addUniqueConstraint("uq_task_buckets", ["name", "project_id"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("ms_task_buckets").execute();
}
