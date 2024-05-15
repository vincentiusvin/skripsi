import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("orgs_users")
    .addColumn("org_id", "integer", (build) =>
      build.references("orgs.id").notNull()
    )
    .addColumn("user_id", "integer", (build) =>
      build.references("users.id").notNull()
    )
    .addColumn("permission", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`NOW()`).notNull()
    )
    .addPrimaryKeyConstraint("orgs_users_pk", ["org_id", "user_id"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("orgs_users").execute();
}
