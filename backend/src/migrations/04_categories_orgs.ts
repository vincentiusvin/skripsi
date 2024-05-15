import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("categories_orgs")
    .addColumn("org_id", "integer", (build) => build.references("orgs.id").notNull())
    .addColumn("category_id", "integer", (build) => build.references("categories.id").notNull())
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`).notNull())
    .addPrimaryKeyConstraint("categories_orgs_pk", ["org_id", "category_id"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("categories_orgs").execute();
}
