import { config } from "dotenv";
import { resolve } from "path";

export function loadEnv() {
  config({
    path: resolve(__dirname, "../.env"),
  });
}
