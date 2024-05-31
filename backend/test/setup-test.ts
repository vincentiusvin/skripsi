import { execSync } from "node:child_process";

export async function mochaGlobalSetup() {
  execSync("tsx src/migrate.ts", {
    env: process.env,
    stdio: "inherit",
  });
}

export const mochaGlobalTeardown = async () => {};
