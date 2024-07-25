import { ExpressionBuilder, Kysely } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { Application } from "../../app.js";
import { DB } from "../../db/db_types.js";
import { Controller, Route } from "../../helpers/controller.js";
import { NotFoundError } from "../../helpers/error.js";
import { RH } from "../../helpers/types.js";

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
    const { bucket_id, name, description, start_at, end_at, before_id } = req.body;

    let target_bucket: number;

    if (bucket_id) {
      target_bucket = bucket_id;
    } else {
      const old_data = await this.db
        .selectFrom("ms_tasks")
        .select("bucket_id")
        .where("ms_tasks.id", "=", Number(task_id))
        .executeTakeFirst();
      if (old_data == undefined) {
        throw new NotFoundError("Gagal menemukan pekerjaan tersebut!");
      }
      target_bucket = old_data.bucket_id;
    }

    await this.db.transaction().execute(async (trx) => {
      let updateOrder: number;
      if (before_id != undefined) {
        const data_after = await trx
          .selectFrom("ms_tasks")
          .select("order")
          .where("ms_tasks.id", "=", before_id)
          .executeTakeFirst();
        if (data_after == undefined) {
          throw new NotFoundError("Gagal mengurutkan pekerjaan!");
        }
        updateOrder = data_after.order;

        await trx
          .updateTable("ms_tasks")
          .set((eb) => ({ order: eb("ms_tasks.order", "+", 1) }))
          .where((eb) =>
            eb.and([eb("order", ">=", updateOrder), eb("bucket_id", "=", target_bucket)]),
          )
          .execute();
      } else {
        const data_after = await trx
          .selectFrom("ms_tasks")
          .select((eb) => eb.fn.max("order").as("order"))
          .where("bucket_id", "=", target_bucket)
          .executeTakeFirst();

        if (data_after == undefined) {
          updateOrder = 1;
          throw new NotFoundError("Gagal mengurutkan pekerjaan!");
        } else {
          updateOrder = data_after.order + 1;
        }
      }

      await trx
        .updateTable("ms_tasks")
        .set({
          bucket_id,
          description,
          end_at,
          name,
          order: updateOrder,
          start_at,
        })
        .where("ms_tasks.id", "=", Number(task_id))
        .execute();
    });

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

    await this.db.transaction().execute(async (trx) => {
      const max_order = await trx
        .selectFrom("ms_tasks")
        .select((eb) => eb.fn.max("order").as("max"))
        .where("bucket_id", "=", Number(bucket_id))
        .executeTakeFirst();

      let order = 1;

      if (max_order != undefined && max_order.max != null) {
        order = max_order.max + 1;
      }

      await trx
        .insertInto("ms_tasks")
        .values({
          bucket_id: Number(bucket_id),
          order,
          name,
          description,
          end_at,
          start_at,
        })
        .execute();
    });

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
      .orderBy(["order asc", "id asc"])
      .execute();

    res.status(200).json(result);
  };
}
