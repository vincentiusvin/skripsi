import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("task_buckets")
    .addColumn("id", "serial", (build) => build.primaryKey())
    .addColumn("project_id", "integer", (build) =>
      build.references("projects.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("name", "text", (build) => build.notNull())
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`).notNull())
    .addUniqueConstraint("uq_task_buckets", ["name", "project_id"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("task_buckets").execute();
}
