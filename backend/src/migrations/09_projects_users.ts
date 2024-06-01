import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("projects_users")
    .addColumn("project_id", "integer", (build) => build.references("ms_projects.id").notNull())
    .addColumn("user_id", "integer", (build) => build.references("ms_users.id").notNull())
    .addColumn("role", "text", (build) => build.notNull())
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`).notNull())
    .addPrimaryKeyConstraint("projects_users_pk", ["project_id", "user_id"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("projects_users").execute();
}
