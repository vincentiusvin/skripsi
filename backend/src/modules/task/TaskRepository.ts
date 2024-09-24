import { ExpressionBuilder, Kysely } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { DB } from "../../db/db_types.js";

function taskWithUsers(eb: ExpressionBuilder<DB, "ms_tasks">) {
  return jsonArrayFrom(
    eb
      .selectFrom("tasks_users")
      .select(["tasks_users.user_id"])
      .whereRef("tasks_users.task_id", "=", "ms_tasks.id"),
  );
}

export class TaskRepository {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async getBucketByID(bucket_id: number) {
    const result = await this.db
      .selectFrom("ms_task_buckets")
      .select(["name", "id", "project_id"])
      .where("ms_task_buckets.id", "=", bucket_id)
      .executeTakeFirst();

    return result;
  }

  async updateBucket(bucket_id: number, data: { name?: string }) {
    if (data.name != undefined) {
      await this.db
        .updateTable("ms_task_buckets")
        .set({
          name: data.name,
        })
        .where("ms_task_buckets.id", "=", bucket_id)
        .executeTakeFirst();
    }
  }

  async deleteBucket(bucket_id: number) {
    await this.db
      .deleteFrom("ms_task_buckets")
      .where("ms_task_buckets.id", "=", bucket_id)
      .execute();
  }

  async deleteTask(task_id: number) {
    const result = await this.db
      .deleteFrom("ms_tasks")
      .where("ms_tasks.id", "=", task_id)
      .execute();

    return result;
  }

  async findTaskByID(task_id: number) {
    const result = await this.db
      .selectFrom("ms_tasks")
      .select((eb) => [
        "ms_tasks.id",
        "ms_tasks.name",
        "ms_tasks.order",
        "ms_tasks.description",
        "ms_tasks.bucket_id",
        "ms_tasks.start_at",
        "ms_tasks.end_at",
        taskWithUsers(eb).as("users"),
      ])
      .where("ms_tasks.id", "=", task_id)
      .executeTakeFirst();

    return result;
  }

  async getTasks(opts: { bucket_id?: number; user_id?: number }) {
    const { bucket_id, user_id } = opts;
    let query = this.db
      .selectFrom("ms_tasks")
      .select((eb) => [
        "ms_tasks.id",
        "ms_tasks.name",
        "ms_tasks.order",
        "ms_tasks.description",
        "ms_tasks.bucket_id",
        "ms_tasks.start_at",
        "ms_tasks.end_at",
        taskWithUsers(eb).as("users"),
      ])
      .orderBy(["order asc", "id asc"]);

    if (bucket_id != undefined) {
      query = query.where("ms_tasks.bucket_id", "=", bucket_id);
    }

    if (user_id != undefined) {
      query = query.where((eb) =>
        eb(
          "ms_tasks.id",
          "in",
          eb
            .selectFrom("tasks_users")
            .select("tasks_users.task_id")
            .where("tasks_users.user_id", "=", user_id),
        ),
      );
    }

    return await query.execute();
  }

  async getMaxOrder(bucket_id: number) {
    const max_order = await this.db
      .selectFrom("ms_tasks")
      .select((eb) => eb.fn.max("order").as("max"))
      .where("bucket_id", "=", bucket_id)
      .executeTakeFirst();
    return max_order?.max;
  }

  async addTask(data: {
    bucket_id: number;
    order: number;
    name: string;
    users?: number[];
    description?: string;
    end_at?: string;
    start_at?: string;
  }) {
    const { order, users, bucket_id, name, description, end_at, start_at } = data;
    return await this.db.transaction().execute(async (trx) => {
      const res = await trx
        .insertInto("ms_tasks")
        .values({
          bucket_id: Number(bucket_id),
          order,
          name,
          description,
          end_at,
          start_at,
        })
        .returning("id")
        .executeTakeFirst();

      if (!res) {
        throw new Error("Gagal memasukkan data!");
      }

      if (users != undefined) {
        for (const user_id of users) {
          await trx
            .insertInto("tasks_users")
            .values({
              task_id: res.id,
              user_id,
            })
            .execute();
        }
      }
      return res;
    });
  }

  /**
   * Buat increment order untuk bucket yang ordernya lebih besar dari angka tertentu.
   * Dipakai biar bisa sisipin angka ke nilai order.
   *
   * @param bucket_id - Bucket yang mau dibump tasknya
   * @param order - Bump semua task yang ordernya lebih besar dari ini.
   * @returns
   */
  async bumpOrderBiggerThan(bucket_id: number, order: number) {
    return await this.db
      .updateTable("ms_tasks")
      .set((eb) => ({ order: eb("ms_tasks.order", "+", 1) }))
      .where((eb) => eb.and([eb("order", ">=", order), eb("bucket_id", "=", bucket_id)]))
      .execute();
  }

  async editTask(
    task_id: number,
    data: {
      order?: number;
      bucket_id?: number;
      name?: string;
      users?: number[];
      description?: string;
      start_at?: string;
      end_at?: string;
    },
  ) {
    const { bucket_id, name, users, description, start_at, end_at, order } = data;
    await this.db.transaction().execute(async (trx) => {
      if (
        bucket_id != undefined ||
        description != undefined ||
        end_at != undefined ||
        name != undefined ||
        order != undefined ||
        start_at != undefined
      ) {
        trx
          .updateTable("ms_tasks")
          .set({
            bucket_id,
            description,
            end_at,
            name,
            order,
            start_at,
          })
          .where("ms_tasks.id", "=", task_id)
          .execute();
      }

      if (users != undefined) {
        await trx.deleteFrom("tasks_users").where("task_id", "=", task_id).execute();
        if (users.length) {
          await trx
            .insertInto("tasks_users")
            .values(
              users.map((user_id) => ({
                task_id,
                user_id,
              })),
            )
            .execute();
        }
      }
    });
  }

  async getBuckets(opts: { project_id?: number }) {
    const { project_id } = opts;
    let query = this.db
      .selectFrom("ms_task_buckets")
      .select(["name", "id", "project_id"])
      .orderBy("ms_task_buckets.id asc");

    if (project_id != undefined) {
      query = query.where("ms_task_buckets.project_id", "=", project_id);
    }

    return query.execute();
  }

  async addBucket(project_id: number, name: string) {
    return this.db
      .insertInto("ms_task_buckets")
      .values({
        name: name,
        project_id: Number(project_id),
      })
      .execute();
  }
}
