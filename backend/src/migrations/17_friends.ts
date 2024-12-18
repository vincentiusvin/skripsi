import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("friends")
    .addColumn("from_user_id", "integer", (build) =>
      build.references("users.id").notNull().onDelete("cascade").onDelete("cascade"),
    )
    .addColumn("to_user_id", "integer", (build) =>
      build.references("users.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("status", "text", (build) => build.notNull())
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`).notNull())
    .addPrimaryKeyConstraint("friends_pk", ["from_user_id", "to_user_id"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("friends").execute();
}
