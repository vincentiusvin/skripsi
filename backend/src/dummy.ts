import { Application } from "./app.js";
import { baseCase } from "./test/helpers.js";
import { clearDB } from "./test/setup-test.js";

async function dummy() {
  const app = Application.getApplication();
  console.log("Clearing db...");
  await clearDB(app);
  console.log("DB cleared!");
  console.log("Inserting dummy data...");
  await baseCase(app);
  console.log("Dummy data inserted!");
  process.exit(0);
}

dummy();
