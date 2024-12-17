import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("chatrooms_users")
    .addColumn("chatroom_id", "integer", (build) =>
      build.references("chatrooms.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("user_id", "integer", (build) =>
      build.references("users.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`).notNull())
    .addPrimaryKeyConstraint("chatrooms_users_pk", ["chatroom_id", "user_id"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("chatrooms_users").execute();
}
