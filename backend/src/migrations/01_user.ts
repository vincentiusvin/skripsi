import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  db.schema
    .createTable("users")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("name", "varchar(255)", (col) => col.notNull())
    .addColumn("password", "varchar(255)", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`NOW()`).notNull()
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  db.schema.dropTable("users").execute();
}
