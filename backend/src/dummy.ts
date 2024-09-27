import { Application } from "./app.js";
import { baseCase } from "./test/helpers.js";

async function dummy() {
  const app = Application.getApplication();
  console.log("Inserting dummy data...");
  await baseCase(app);
  console.log("Dummy data inserted!");
  process.exit(0);
}

dummy();
