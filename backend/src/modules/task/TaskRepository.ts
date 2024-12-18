import { ExpressionBuilder, Kysely } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { DB } from "../../db/db_types.js";

function taskWithUsers(eb: ExpressionBuilder<DB, "tasks">) {
  return jsonArrayFrom(
    eb
      .selectFrom("tasks_users")
      .select(["tasks_users.user_id"])
      .whereRef("tasks_users.task_id", "=", "tasks.id"),
  );
}

export class TaskRepository {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async getBucketByID(bucket_id: number) {
    const result = await this.db
      .selectFrom("task_buckets")
      .select(["name", "id", "project_id"])
      .where("task_buckets.id", "=", bucket_id)
      .executeTakeFirst();

    return result;
  }

  async updateBucket(bucket_id: number, data: { name?: string }) {
    if (data.name != undefined) {
      await this.db
        .updateTable("task_buckets")
        .set({
          name: data.name,
        })
        .where("task_buckets.id", "=", bucket_id)
        .executeTakeFirst();
    }
  }

  async deleteBucket(bucket_id: number) {
    await this.db.deleteFrom("task_buckets").where("task_buckets.id", "=", bucket_id).execute();
  }

  async deleteTask(task_id: number) {
    const result = await this.db.deleteFrom("tasks").where("tasks.id", "=", task_id).execute();

    return result;
  }

  async getTaskByID(task_id: number) {
    const result = await this.db
      .selectFrom("tasks")
      .select((eb) => [
        "tasks.id",
        "tasks.name",
        "tasks.order",
        "tasks.description",
        "tasks.bucket_id",
        "tasks.start_at",
        "tasks.end_at",
        taskWithUsers(eb).as("users"),
      ])
      .where("tasks.id", "=", task_id)
      .executeTakeFirst();

    return result;
  }

  async getTasks(opts: { bucket_id?: number; user_id?: number }) {
    const { bucket_id, user_id } = opts;
    let query = this.db
      .selectFrom("tasks")
      .select((eb) => [
        "tasks.id",
        "tasks.name",
        "tasks.order",
        "tasks.description",
        "tasks.bucket_id",
        "tasks.start_at",
        "tasks.end_at",
        taskWithUsers(eb).as("users"),
      ])
      .orderBy(["order asc", "id asc"]);

    if (bucket_id != undefined) {
      query = query.where("tasks.bucket_id", "=", bucket_id);
    }

    if (user_id != undefined) {
      query = query.where((eb) =>
        eb(
          "tasks.id",
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
      .selectFrom("tasks")
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
    const res = await this.db
      .insertInto("tasks")
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
        await this.db
          .insertInto("tasks_users")
          .values({
            task_id: res.id,
            user_id,
          })
          .execute();
      }
    }
    return res;
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
      .updateTable("tasks")
      .set((eb) => ({ order: eb("tasks.order", "+", 1) }))
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
      description?: string | null;
      start_at?: string | null;
      end_at?: string | null;
    },
  ) {
    const { bucket_id, name, users, description, start_at, end_at, order } = data;
    if (
      bucket_id !== undefined ||
      description !== undefined ||
      end_at !== undefined ||
      name !== undefined ||
      order !== undefined ||
      start_at !== undefined
    ) {
      this.db
        .updateTable("tasks")
        .set({
          bucket_id,
          description,
          end_at,
          name,
          order,
          start_at,
        })
        .where("tasks.id", "=", task_id)
        .execute();
    }

    if (users != undefined) {
      await this.db.deleteFrom("tasks_users").where("task_id", "=", task_id).execute();
      if (users.length) {
        await this.db
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
  }

  async getBuckets(opts: { project_id?: number }) {
    const { project_id } = opts;
    let query = this.db
      .selectFrom("task_buckets")
      .select(["name", "id", "project_id"])
      .orderBy("task_buckets.id asc");

    if (project_id != undefined) {
      query = query.where("task_buckets.project_id", "=", project_id);
    }

    return query.execute();
  }

  async addBucket(project_id: number, name: string) {
    return this.db
      .insertInto("task_buckets")
      .values({
        name: name,
        project_id: Number(project_id),
      })
      .returning("task_buckets.id")
      .executeTakeFirst();
  }
}
