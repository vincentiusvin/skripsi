import chai = require("chai");
import chaiSubset = require("chai-subset");
import { Kysely } from "kysely";
import { execSync } from "node:child_process";
import { Application } from "../app.js";
import { DB } from "../db/db_types.js";

export async function mochaGlobalSetup() {
  chai.use(chaiSubset);

  const app = Application.getApplication();
  await app.db.schema.dropSchema("public").cascade().execute();
  await app.db.schema.createSchema("public").execute();

  execSync("tsx src/migrate.ts latest", {
    env: process.env,
  });

  if (process.env.BACKEND_PORT) {
    app.listen(Number(process.env.BACKEND_PORT));
  } else {
    console.log("Application port undefined!");
    process.exit(1);
  }
}

export async function mochaGlobalTeardown() {
  await Application.getApplication().close();
}

export async function clearDB(db: Kysely<DB>) {
  await db.deleteFrom("ms_notifications").execute();
  await db.deleteFrom("ms_contributions_users").execute();
  await db.deleteFrom("ms_contributions").execute();
  await db.deleteFrom("ms_friends").execute();
  await db.deleteFrom("tasks_users").execute();
  await db.deleteFrom("ms_tasks").execute();
  await db.deleteFrom("ms_task_buckets").execute();
  await db.deleteFrom("ms_messages").execute();
  await db.deleteFrom("chatrooms_users").execute();
  await db.deleteFrom("ms_chatrooms").execute();
  await db.deleteFrom("projects_users").execute();
  await db.deleteFrom("categories_projects").execute();
  await db.deleteFrom("ms_category_projects").execute();
  await db.deleteFrom("ms_projects").execute();
  await db.deleteFrom("orgs_users").execute();
  await db.deleteFrom("categories_orgs").execute();
  await db.deleteFrom("ms_category_orgs").execute();
  await db.deleteFrom("ms_orgs").execute();
  await db.deleteFrom("ms_users").where("ms_users.is_admin", "=", false).execute();
  await db.deleteFrom("session").execute();
}
