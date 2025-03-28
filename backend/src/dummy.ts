import { Application } from "./app.js";
import { baseCase } from "./test/fixture_data.js";

async function dummy() {
  const app = Application.getApplication();
  console.log("Inserting dummy data...");
  await baseCase(app.db);
  console.log("Dummy data inserted!");
  process.exit(0);
}

dummy();
