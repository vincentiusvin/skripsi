import { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("ms_contributions_users")
    .addColumn("contributions_id", "integer", (build) =>
      build.references("ms_contributions.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("user_id", "integer", (build) =>
      build.references("ms_users.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("ms_contributions_users").execute();
}
