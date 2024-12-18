import { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("contributions_users")
    .addColumn("contributions_id", "integer", (build) =>
      build.references("contributions.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("user_id", "integer", (build) =>
      build.references("users.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addPrimaryKeyConstraint("contribusions_users_pk", ["contributions_id", "user_id"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("contributions_users").execute();
}
