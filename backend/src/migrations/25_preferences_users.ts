import { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("preferences_users")
    .addColumn("user_id", "integer", (build) =>
      build.references("users.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("preference_id", "integer", (build) =>
      build.references("preferences.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addPrimaryKeyConstraint("preferences_users_pk", ["preference_id", "user_id"])
    .addColumn("value", "text", (b) => b.notNull())
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("preferences_users").execute();
}
