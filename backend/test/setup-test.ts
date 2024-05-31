import { execSync } from "node:child_process";
import { Application } from "../src/app.js";

export async function mochaGlobalSetup() {
  console.log("Running migrations...");
  execSync("tsx src/migrate.ts", {
    env: process.env,
    stdio: "inherit",
  });
  console.log("Migrations done!");

  const app = Application.getApplication();
  if (process.env.APPLICATION_PORT) {
    app.listen(Number(process.env.APPLICATION_PORT));
  } else {
    console.log("Application port undefined!");
    process.exit(1);
  }
}

export const mochaGlobalTeardown = async () => {};
