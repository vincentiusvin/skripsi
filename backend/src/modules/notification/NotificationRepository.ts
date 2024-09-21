import { Kysely } from "kysely";
import { DB } from "../../db/db_types.js";
import { NotificationTypes, parseNotificationType } from "./NotificationMisc.js";

export class NotificationRepository {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async getNotifications(opts: { user_id?: number; read?: boolean }) {
    const { user_id, read } = opts;
    let query = this.db
      .selectFrom("ms_notifications")
      .select(["title", "type", "type_id", "description", "user_id", "created_at", "read", "id"])
      .orderBy("created_at desc");

    if (user_id != undefined) {
      query = query.where("user_id", "=", user_id);
    }

    if (read != undefined) {
      query = query.where("read", "=", read);
    }

    const result = await query.execute();
    return result.map((x) => ({
      ...x,
      type: parseNotificationType(x.type),
    }));
  }

  async getNotification(notification_id: number) {
    const result = await this.db
      .selectFrom("ms_notifications")
      .select(["title", "type", "type_id", "description", "user_id", "created_at", "read", "id"])
      .where("ms_notifications.id", "=", notification_id)
      .executeTakeFirst();

    if (!result) {
      return undefined;
    }

    return {
      ...result,
      type: parseNotificationType(result.type),
    };
  }

  async updateNotification(
    notification_id: number,
    opts: {
      read?: boolean;
      title?: string;
      description?: string;
      type?: NotificationTypes;
      type_id?: number;
    },
  ) {
    const { read, title, description, type, type_id } = opts;

    if (
      read == undefined &&
      title == undefined &&
      description == undefined &&
      type == undefined &&
      type_id == undefined
    ) {
      return;
    }

    return await this.db
      .updateTable("ms_notifications")
      .set({
        read,
        title,
        description,
        type,
        type_id,
      })
      .where("id", "=", notification_id)
      .execute();
  }

  async addNotification(opts: {
    title: string;
    description: string;
    type: NotificationTypes;
    type_id?: number;
    user_id: number;
  }) {
    const { title, description, type, user_id, type_id } = opts;

    return await this.db
      .insertInto("ms_notifications")
      .values({
        user_id,
        title,
        description,
        type,
        type_id,
        read: false,
      })
      .returning("id")
      .executeTakeFirst();
  }
}
