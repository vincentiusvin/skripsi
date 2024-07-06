import { execSync } from "node:child_process";
import { Application } from "../src/app.js";

export async function setupApp() {
  execSync("tsx src/migrate.ts", {
    env: process.env,
  });

  const app = Application.getApplication();
  if (process.env.APPLICATION_PORT) {
    app.listen(Number(process.env.APPLICATION_PORT));
  } else {
    console.log("Application port undefined!");
    process.exit(1);
  }

  return app;
}

export async function clearDB(app: Application) {
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
