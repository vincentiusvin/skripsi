import { hashSync } from "bcryptjs";
import { Kysely } from "kysely";
import { DB } from "../db/db_types.js";

export async function up(db: Kysely<DB>): Promise<void> {
  const admin_password = process.env.ADMIN_PASSWORD;
  if (admin_password == undefined) {
    throw new Error("Admin password not set!");
  }

  await db.schema
    .alterTable("ms_users")
    .addColumn("is_admin", "boolean", (build) => build.notNull().defaultTo(false))
    .execute();

  await db
    .insertInto("ms_users")
    .values({
      name: "Admin",
      password: hashSync(admin_password, 10),
      email: "noreply@example.com",
      is_admin: true,
    })
    .execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.deleteFrom("ms_users").where("is_admin", "=", true).execute();
  await db.schema.alterTable("ms_users").dropColumn("is_admin").execute();
}
