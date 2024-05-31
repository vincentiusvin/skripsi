import { Application } from "./app.js";

const app = Application.getApplication();
if (process.env.APPLICATION_PORT) {
  app.listen(Number(process.env.APPLICATION_PORT));
} else {
  console.log("Application port undefined!");
  process.exit(1);
}
