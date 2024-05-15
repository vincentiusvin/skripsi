import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("orgs_users")
    .addColumn("orgs_id", "bigint", (col) => col.unsigned())
    .addColumn("users_id", "bigint", (col) => col.unsigned())
    .addColumn("permission", "text", (col) => col.notNull())
    .addForeignKeyConstraint("orgs_users_orgs_fk", ["orgs_id"], "orgs", ["id"])
    .addForeignKeyConstraint("orgs_users_users_fk", ["users_id"], "users", [
      "id",
    ])
    .addPrimaryKeyConstraint("orgs_users_pk", ["orgs_id", "users_id"])
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`NOW()`).notNull()
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("orgs_users").execute();
}
