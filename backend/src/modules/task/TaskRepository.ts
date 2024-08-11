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

  async findTasksByBucket(bucket_id: number) {
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
      .where("ms_tasks.bucket_id", "=", bucket_id)
      .orderBy(["order asc", "id asc"])
      .execute();

    return result;
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
    description?: string;
    end_at?: string;
    start_at?: string;
  }) {
    const { order, bucket_id, name, description, end_at, start_at } = data;
    return await this.db
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
      description?: string;
      start_at?: string;
      end_at?: string;
    },
  ) {
    const { bucket_id, name, description, start_at, end_at, order } = data;
    await this.db
      .updateTable("ms_tasks")
      .set({
        bucket_id,
        description,
        end_at,
        name,
        order,
        start_at,
      })
      .where("ms_tasks.id", "=", Number(task_id))
      .execute();
  }

  async getProjectBuckets(project_id: number) {
    return await this.db
      .selectFrom("ms_task_buckets")
      .select(["name", "id"])
      .where("ms_task_buckets.project_id", "=", project_id)
      .execute();
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
