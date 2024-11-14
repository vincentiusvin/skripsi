import { Application } from "./app.js";
import seedData from "./test/seed_data.js";

async function seed() {
  const app = Application.getApplication();
  console.log("Inserting dummy data...");
  await seedData(app.db);
  console.log("Dummy data inserted!");
  process.exit(0);
}

seed();
