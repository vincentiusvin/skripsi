import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("tasks_users")
    .addColumn("task_id", "integer", (build) =>
      build.references("ms_tasks.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("user_id", "integer", (build) =>
      build.references("ms_users.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`).notNull())
    .addPrimaryKeyConstraint("tasks_users_pk", ["task_id", "user_id"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("tasks_users").execute();
}
