import { ExpressionBuilder, Kysely } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { Application } from "../app.js";
import { DB } from "../db/db_types.js";
import { RH } from "../helpers/types.js";
import { Controller, Route } from "./controller.js";

function withUsers(eb: ExpressionBuilder<DB, "ms_tasks">) {
  return jsonArrayFrom(
    eb
      .selectFrom("ms_users")
      .innerJoin("tasks_users", "tasks_users.user_id", "ms_users.id")
      .select(["ms_users.id", "ms_tasks.name"])
      .whereRef("tasks_users.task_id", "=", "ms_tasks.id"),
  );
}

export class TaskController extends Controller {
  private db: Kysely<DB>;
  constructor(app: Application) {
    super(app);
    this.db = app.db;
  }

  init() {
    return {
      TasksDetailPut: new Route({
        handler: this.putTasksDetail,
        method: "put",
        path: "/api/tasks/:task_id",
      }),
      BucketsDetailTasksPost: new Route({
        handler: this.postBucketsDetailTasks,
        method: "post",
        path: "/api/buckets/:bucket_id/tasks",
      }),
      BucketsDetailTasksGet: new Route({
        handler: this.getBucketsDetailTasks,
        method: "get",
        path: "/api/buckets/:bucket_id/tasks",
      }),
    };
  }

  private putTasksDetail: RH<{
    Params: {
      task_id: string;
    };
    ReqBody: {
      bucket_id?: number;
      before_id?: number;
      name?: string;
      description?: string;
      start_at?: string;
      end_at?: string;
    };
    ResBody: {
      msg: string;
    };
  }> = async (req, res) => {
    const { task_id } = req.params;
    const { bucket_id, name, description, start_at, end_at } = req.body;

    await this.db
      .updateTable("ms_tasks")
      .set({
        bucket_id: bucket_id ? Number(bucket_id) : undefined,
        name,
        description,
        start_at,
        end_at,
      })
      .where("ms_tasks.id", "=", Number(task_id))
      .execute();

    res.status(200).json({ msg: "Task successfully updated!" });
  };

  private postBucketsDetailTasks: RH<{
    Params: {
      bucket_id: string;
    };
    ResBody: {
      msg: string;
    };
    ReqBody: {
      name: string;
      description?: string;
      end_at?: Date;
      start_at?: Date;
    };
  }> = async (req, res) => {
    const { bucket_id } = req.params;
    const { name, description, end_at, start_at } = req.body;

    console.log(req.body);

    await this.db
      .insertInto("ms_tasks")
      .values({
        bucket_id: Number(bucket_id),
        name,
        description,
        end_at,
        start_at,
      })
      .execute();

    res.status(201).json({ msg: "Task successfully created!" });
  };

  private getBucketsDetailTasks: RH<{
    Params: {
      bucket_id: string;
    };
    ResBody: {
      id: number;
      name: string;
      description: string | null;
      end_at: Date | null;
      start_at: Date | null;
      users: {
        id: number;
        name: string;
      }[];
    }[];
  }> = async (req, res) => {
    const { bucket_id } = req.params;

    const result = await this.db
      .selectFrom("ms_tasks")
      .select((eb) => [
        "ms_tasks.id",
        "ms_tasks.name",
        "ms_tasks.description",
        "ms_tasks.bucket_id",
        "ms_tasks.start_at",
        "ms_tasks.end_at",
        withUsers(eb).as("users"),
      ])
      .where("ms_tasks.bucket_id", "=", Number(bucket_id))
      .execute();

    res.status(200).json(result);
  };
}
