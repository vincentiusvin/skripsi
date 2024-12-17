import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("socials_users")
    .addColumn("user_id", "integer", (build) =>
      build.references("users.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("social", "text", (eb) => eb.notNull())
    .addPrimaryKeyConstraint("socials_users_pk", ["social", "user_id"])
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`).notNull())
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("socials_users").execute();
}
