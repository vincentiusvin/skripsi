import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("categories_orgs")
    .addColumn("org_id", "integer", (build) =>
      build.references("orgs.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("category_id", "integer", (build) =>
      build.references("category_orgs.id").onDelete("cascade").onUpdate("cascade").notNull(),
    )
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`).notNull())
    .addPrimaryKeyConstraint("categories_orgs_pk", ["org_id", "category_id"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("categories_orgs").execute();
}
