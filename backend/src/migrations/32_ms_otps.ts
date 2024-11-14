import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("ms_otps")
    .addColumn("token", "uuid", (eb) => eb.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("email", "text", (eb) => eb.notNull())
    .addColumn("otp", "text", (eb) => eb.notNull())
    .addColumn("used", "boolean", (eb) => eb.notNull().defaultTo(false))
    .addColumn("verified", "boolean", (eb) => eb.notNull().defaultTo(false))
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`).notNull())
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("ms_otps").execute();
}
