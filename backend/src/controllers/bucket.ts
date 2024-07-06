import { ExpressionBuilder, Kysely } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres.js";
import { Application } from "../app.js";
import { DB } from "../db/db_types.js";
import { RHTop } from "../helpers/types.js";
import { Controller, Route } from "./controller.js";

export function withTasks(eb: ExpressionBuilder<DB, "ms_task_buckets">) {
  return jsonArrayFrom(
    eb
      .selectFrom("ms_tasks")
      .select((eb) => [
        "ms_tasks.name",
        "ms_tasks.description",
        "ms_tasks.start_at",
        "ms_tasks.end_at",
        jsonArrayFrom(eb.selectFrom("ms_users").select(["ms_users.id"])).as("users"),
      ])
      .whereRef("ms_tasks.bucket_id", "=", "ms_task_buckets.id"),
  );
}

export class BucketController extends Controller {
  private db: Kysely<DB>;
  constructor(app: Application) {
    super(app);
    this.db = app.db;
  }

  init(): Record<string, Route<RHTop>> {
    return {};
  }
}
