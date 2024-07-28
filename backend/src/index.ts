import { Application } from "./app.js";

const app = Application.getApplication();
if (process.env.BACKEND_PORT) {
  app.listen(Number(process.env.BACKEND_PORT));
} else {
  console.log("Application port undefined!");
  process.exit(1);
}
