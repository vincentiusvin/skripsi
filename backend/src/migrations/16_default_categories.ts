import { Kysely } from "kysely";
import { DB } from "../db/db_types.js";

export async function up(db: Kysely<DB>): Promise<void> {
  await db
    .insertInto("category_orgs")
    .values([
      {
        name: "Pendidikan",
      },
      {
        name: "Lingkungan",
      },
      {
        name: "Kesehatan",
      },
      {
        name: "Keagamaan",
      },
      {
        name: "Kerajinan",
      },
    ])
    .execute();

  await db
    .insertInto("category_projects")
    .values([
      {
        name: "Website",
      },
      {
        name: "Aplikasi Mobile",
      },
      {
        name: "Aplikasi Desktop",
      },
    ])
    .execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db
    .deleteFrom("category_orgs")
    .where("category_orgs.name", "in", [
      "Pendidikan",
      "Lingkungan",
      "Kesehatan",
      "Keagamaan",
      "Kerajinan",
    ])
    .execute();

  await db
    .deleteFrom("category_projects")
    .where("category_projects.name", "in", ["Website", "Aplikasi Mobile", "Aplikasi Desktop"])
    .execute();
}
