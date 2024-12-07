import { ExpressionBuilder, Kysely } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { DB } from "../../db/db_types.js";
import { ClientError } from "../../helpers/error.js";

const defaultChatroomFields = [
  "ms_chatrooms.id as chatroom_id",
  "ms_chatrooms.name as chatroom_name",
  "ms_chatrooms.project_id",
  "ms_chatrooms.created_at as chatroom_created_at",
] as const;

const defaultMessageFields = (eb: ExpressionBuilder<DB, "ms_messages">) =>
  [
    "ms_messages.id as id",
    "ms_messages.message as message",
    "ms_messages.created_at as created_at",
    "ms_messages.user_id as user_id",
    "ms_messages.is_edited as is_edited",
    "ms_messages.chatroom_id as chatroom_id",
    messageWithAttachments(eb).as("files"),
  ] as const;

function chatroomWithUsers(eb: ExpressionBuilder<DB, "ms_chatrooms">) {
  return jsonArrayFrom(
    eb
      .selectFrom("chatrooms_users")
      .select("chatrooms_users.user_id")
      .whereRef("chatrooms_users.chatroom_id", "=", "ms_chatrooms.id"),
  );
}

function messageWithAttachments(eb: ExpressionBuilder<DB, "ms_messages">) {
  return jsonArrayFrom(
    eb
      .selectFrom("ms_chatroom_files as f")
      .select(["f.id", "f.filename"])
      .whereRef("f.message_id", "=", "ms_messages.id"),
  );
}

export class ChatRepository {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async getMembers(chatroom_id: number) {
    const result = await this.db
      .selectFrom("chatrooms_users")
      .select("chatrooms_users.user_id")
      .where("chatroom_id", "=", chatroom_id)
      .execute();

    return result.map((x) => x.user_id);
  }

  async findChatroomByFileID(file_id: number) {
    return await this.db
      .selectFrom("ms_chatroom_files as f")
      .innerJoin("ms_messages as m", "m.id", "f.message_id")
      .innerJoin("ms_chatrooms as c", "c.id", "m.chatroom_id")
      .select("c.id")
      .where("f.id", "=", file_id)
      .executeTakeFirst();
  }

  async getMessages(opts: { chatroom_id: number; limit?: number; before_message_id?: number }) {
    const { chatroom_id, before_message_id, limit } = opts;
    let query = this.db
      .selectFrom("ms_messages")
      .select(defaultMessageFields)
      .where("ms_messages.chatroom_id", "=", chatroom_id)
      .orderBy("id desc");

    if (before_message_id != undefined) {
      query = query.where("ms_messages.id", "<", before_message_id);
    }
    if (limit != undefined) {
      query = query.limit(limit);
    }

    return query.execute();
  }

  async addMessage(
    chatroom_id: number,
    data: {
      sender_id: number;
      message: string;
      is_edited?: boolean;
      files?: {
        filename: string;
        content: string;
      }[];
    },
  ) {
    const { message, files, sender_id, is_edited } = data;

    const res = await this.db
      .insertInto("ms_messages")
      .values({
        chatroom_id: chatroom_id,
        message: message,
        user_id: sender_id,
        is_edited,
      })
      .returning("id")
      .executeTakeFirst();

    if (!res) {
      throw new Error("Pesan gagal dimasukkan!");
    }

    if (files != undefined && files.length) {
      const files_cleaned = files.flatMap((x) => {
        const b64_data = x.content.split(",")[1];
        if (b64_data == undefined) {
          return [];
        }
        const buf = Buffer.from(b64_data, "base64");

        return [
          {
            content: buf,
            message_id: res.id,
            filename: x.filename,
          },
        ];
      });

      if (files_cleaned.length == 0) {
        throw new ClientError("Ditemukan file yang invalid!");
      }

      await this.db.insertInto("ms_chatroom_files").values(files_cleaned).execute();
    }

    return res;
  }

  async getFile(file_id: number) {
    return this.db
      .selectFrom("ms_chatroom_files")
      .select(["id", "filename", "content", "message_id"])
      .where("id", "=", file_id)
      .executeTakeFirst();
  }

  async updateMessage(
    message_id: number,
    data: {
      chatroom_id?: number;
      sender_id?: number;
      message?: string;
      is_edited?: boolean;
      files?: {
        filename: string;
        content: string;
      }[];
    },
  ) {
    const { files, chatroom_id, sender_id, message, is_edited } = data;

    if (
      chatroom_id == undefined &&
      sender_id == undefined &&
      message == undefined &&
      is_edited == undefined
    ) {
      return;
    }

    const res = await this.db
      .updateTable("ms_messages")
      .set({
        chatroom_id: chatroom_id,
        message: message,
        user_id: sender_id,
        is_edited,
      })
      .where("id", "=", message_id)
      .executeTakeFirst();

    if (!res) {
      throw new Error("Pesan gagal dimasukkan!");
    }

    if (files != undefined && files.length) {
      await this.db.deleteFrom("ms_chatroom_files").where("id", "=", message_id).execute();

      const files_cleaned = files.flatMap((x) => {
        const b64_data = x.content.split(",")[1];
        if (b64_data == undefined) {
          return [];
        }
        const buf = Buffer.from(b64_data, "base64url");

        return [
          {
            content: buf,
            message_id: message_id,
            filename: x.filename,
          },
        ];
      });

      if (files_cleaned.length == 0) {
        throw new ClientError("Ditemukan file yang invalid!");
      }

      await this.db.insertInto("ms_chatroom_files").values(files_cleaned).execute();
    }

    return res;
  }

  async getMessage(message_id: number) {
    return await this.db
      .selectFrom("ms_messages")
      .select(defaultMessageFields)
      .where("id", "=", message_id)
      .executeTakeFirst();
  }

  async getChatroomByID(chatroom_id: number) {
    return await this.db
      .selectFrom("ms_chatrooms")
      .select((eb) => [...defaultChatroomFields, chatroomWithUsers(eb).as("chatroom_users")])
      .where("ms_chatrooms.id", "=", chatroom_id)
      .executeTakeFirst();
  }

  async getChatrooms(opts: { project_id?: number; user_id?: number; keyword?: string }) {
    const { project_id, user_id, keyword } = opts;

    let query = this.db
      .selectFrom("ms_chatrooms")
      .select((eb) => [...defaultChatroomFields, chatroomWithUsers(eb).as("chatroom_users")])
      .orderBy("chatroom_id", "desc");

    if (project_id != undefined) {
      query = query.where("project_id", "=", project_id);
    }
    if (user_id != undefined) {
      query = query.where("ms_chatrooms.id", "in", (eb) =>
        eb.selectFrom("chatrooms_users").select("chatroom_id").where("user_id", "=", user_id),
      );
    }

    if (keyword != undefined) {
      query = query.where("ms_chatrooms.name", "ilike", `%${keyword}%`);
    }

    return await query.execute();
  }

  async addChatroom(opts: { user_ids?: number[]; project_id?: number; chatroom_name: string }) {
    const { project_id, user_ids, chatroom_name } = opts;
    const room_id = await this.db
      .insertInto("ms_chatrooms")
      .values({
        name: chatroom_name,
        project_id,
      })
      .returning(["id"])
      .executeTakeFirst();

    if (!room_id) {
      throw new Error("Data not inserted!");
    }

    if (user_ids !== undefined && user_ids.length > 0) {
      await this.db
        .insertInto("chatrooms_users")
        .values(
          user_ids.map((user_id) => ({
            chatroom_id: room_id.id,
            user_id: user_id,
          })),
        )
        .execute();
    }

    return room_id.id;
  }

  async updateChatroom(chatroom_id: number, opts: { name?: string; user_ids?: number[] }) {
    const { name, user_ids } = opts;
    if (name) {
      await this.db
        .updateTable("ms_chatrooms")
        .set("name", name)
        .where("id", "=", chatroom_id)
        .execute();
    }

    if (user_ids != undefined) {
      await this.db.deleteFrom("chatrooms_users").where("chatroom_id", "=", chatroom_id).execute();

      if (user_ids.length) {
        await this.db
          .insertInto("chatrooms_users")
          .values(
            user_ids.map((user_id) => ({
              chatroom_id: chatroom_id,
              user_id: user_id,
            })),
          )
          .execute();
      }
    }
  }

  async deleteChatroom(chatroom_id: number) {
    return await this.db
      .deleteFrom("ms_chatrooms")
      .where("ms_chatrooms.id", "=", chatroom_id)
      .execute();
  }
}
