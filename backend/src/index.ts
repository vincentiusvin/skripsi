import express from "express";
import { getTest } from "./routes/test";
import { postTest } from "./routes/test2";

const app = express();

app.get("/api/test", getTest);
app.post("/api/test", postTest);

app.listen(5000, () => {
  console.log("Server listening on port 5000");
});
