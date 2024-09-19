import { Kysely } from "kysely";
import { DB } from "../../db/db_types.js";

export class NotificationRepository {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async getNotifications(opts: { user_id?: number; read?: boolean }) {
    const { user_id, read } = opts;
    let query = this.db
      .selectFrom("ms_notifications")
      .select(["title", "type", "description", "user_id", "created_at", "read", "id"]);

    if (user_id != undefined) {
      query = query.where("user_id", "=", user_id);
    }

    if (read != undefined) {
      query = query.where("read", "=", read);
    }

    return await query.execute();
  }

  async getNotification(notification_id: number) {
    return await this.db
      .selectFrom("ms_notifications")
      .select(["title", "type", "description", "user_id", "created_at", "read", "id"])
      .where("ms_notifications.id", "=", notification_id)
      .executeTakeFirst();
  }

  async updateNotification(
    notification_id: number,
    opts: { read?: boolean; title?: string; description?: string; type?: string },
  ) {
    const { read, title, description, type } = opts;

    if (read == undefined && title == undefined && description == undefined && type == undefined) {
      return;
    }

    return await this.db
      .updateTable("ms_notifications")
      .set({
        read,
        title,
        description,
        type,
      })
      .where("id", "=", notification_id)
      .execute();
  }

  async addNotification(opts: {
    title: string;
    description: string;
    type: string;
    user_id: number;
  }) {
    const { title, description, type, user_id } = opts;

    return await this.db
      .insertInto("ms_notifications")
      .values({
        user_id,
        title,
        description,
        type,
        read: false,
      })
      .returning("id")
      .executeTakeFirst();
  }
}
