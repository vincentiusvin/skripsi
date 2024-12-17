import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("otps")
    .addColumn("token", "uuid", (eb) => eb.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("email", "text", (eb) => eb.notNull())
    .addColumn("otp", "text", (eb) => eb.notNull())
    .addColumn("type", "text", (eb) => eb.notNull())
    .addColumn("used_at", "timestamp")
    .addColumn("verified_at", "timestamp")
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`).notNull())
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("otps").execute();
}
