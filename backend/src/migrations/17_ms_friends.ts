import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("ms_friends")
    .addColumn("from_user_id", "integer", (build) => build.references("ms_users.id").notNull())
    .addColumn("to_user_id", "integer", (build) => build.references("ms_users.id").notNull())
    .addColumn("status", "text", (build) => build.notNull())
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`).notNull())
    .addPrimaryKeyConstraint("friends_pk", ["from_user_id", "to_user_id"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("ms_friends").execute();
}
