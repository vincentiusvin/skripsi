import { execSync } from "node:child_process";
import { Application } from "../app.js";

export async function mochaGlobalSetup() {
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

export async function clearDB(app: Application) {
  await app.db.deleteFrom("ms_contributions_users").execute();
  await app.db.deleteFrom("ms_contributions").execute();
  await app.db.deleteFrom("ms_friends").execute();
  await app.db.deleteFrom("tasks_users").execute();
  await app.db.deleteFrom("ms_tasks").execute();
  await app.db.deleteFrom("ms_task_buckets").execute();
  await app.db.deleteFrom("ms_messages").execute();
  await app.db.deleteFrom("chatrooms_users").execute();
  await app.db.deleteFrom("ms_chatrooms").execute();
  await app.db.deleteFrom("projects_users").execute();
  await app.db.deleteFrom("categories_projects").execute();
  await app.db.deleteFrom("ms_category_projects").execute();
  await app.db.deleteFrom("ms_projects").execute();
  await app.db.deleteFrom("orgs_users").execute();
  await app.db.deleteFrom("categories_orgs").execute();
  await app.db.deleteFrom("ms_category_orgs").execute();
  await app.db.deleteFrom("ms_orgs").execute();
  await app.db.deleteFrom("ms_users").execute();
  await app.db.deleteFrom("session").execute();
}
