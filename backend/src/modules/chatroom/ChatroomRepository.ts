import { ExpressionBuilder, Kysely } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { DB } from "../../db/db_types.js";
import { ClientError } from "../../helpers/error.js";

const defaultChatroomFields = [
  "chatrooms.id as chatroom_id",
  "chatrooms.name as chatroom_name",
  "chatrooms.project_id",
  "chatrooms.created_at as chatroom_created_at",
] as const;

const defaultMessageFields = (eb: ExpressionBuilder<DB, "messages">) =>
  [
    "messages.id as id",
    "messages.message as message",
    "messages.created_at as created_at",
    "messages.user_id as user_id",
    "messages.is_edited as is_edited",
    "messages.chatroom_id as chatroom_id",
    messageWithAttachments(eb).as("files"),
  ] as const;

function chatroomWithUsers(eb: ExpressionBuilder<DB, "chatrooms">) {
  return jsonArrayFrom(
    eb
      .selectFrom("chatrooms_users")
      .select("chatrooms_users.user_id")
      .whereRef("chatrooms_users.chatroom_id", "=", "chatrooms.id"),
  );
}

function messageWithAttachments(eb: ExpressionBuilder<DB, "messages">) {
  return jsonArrayFrom(
    eb
      .selectFrom("chatroom_files as f")
      .select(["f.id", "f.filename", "f.filetype"])
      .whereRef("f.message_id", "=", "messages.id"),
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
      .selectFrom("chatroom_files as f")
      .innerJoin("messages as m", "m.id", "f.message_id")
      .innerJoin("chatrooms as c", "c.id", "m.chatroom_id")
      .select("c.id")
      .where("f.id", "=", file_id)
      .executeTakeFirst();
  }

  async getMessages(opts: { chatroom_id: number; limit?: number; before_message_id?: number }) {
    const { chatroom_id, before_message_id, limit } = opts;
    let query = this.db
      .selectFrom("messages")
      .select(defaultMessageFields)
      .where("messages.chatroom_id", "=", chatroom_id)
      .orderBy("id desc");

    if (before_message_id != undefined) {
      query = query.where("messages.id", "<", before_message_id);
    }
    if (limit != undefined) {
      query = query.limit(limit);
    }

    return query.execute();
  }

  private base64ToData(x: string) {
    const [b64prefix, b64data] = x.split(",");
    if (b64prefix == undefined || b64data == undefined) {
      throw new Error("Gagal memproses file!");
    }
    const [almostMime, b64] = b64prefix.split(";");
    if (b64 != "base64") {
      throw new Error("Data tidak diencode menggunakan base64!");
    }
    const [dataLiteral, mime] = almostMime.split(":");
    if (dataLiteral != "data") {
      throw new Error("Format data tidak diketahui!");
    }

    const buf = Buffer.from(b64data, "base64");

    return {
      content: buf,
      mime: mime,
    };
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
      .insertInto("messages")
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
        const { mime, content } = this.base64ToData(x.content);

        return [
          {
            message_id: res.id,
            filename: x.filename,
            content,
            filetype: mime,
          },
        ];
      });

      if (files_cleaned.length == 0) {
        throw new ClientError("Ditemukan file yang invalid!");
      }

      await this.db.insertInto("chatroom_files").values(files_cleaned).execute();
    }

    return res;
  }

  async getFile(file_id: number) {
    return this.db
      .selectFrom("chatroom_files")
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
      .updateTable("messages")
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
      await this.db.deleteFrom("chatroom_files").where("id", "=", message_id).execute();

      const files_cleaned = files.flatMap((x) => {
        const { mime, content } = this.base64ToData(x.content);

        return [
          {
            content,
            message_id: message_id,
            filename: x.filename,
            filetype: mime,
          },
        ];
      });

      if (files_cleaned.length == 0) {
        throw new ClientError("Ditemukan file yang invalid!");
      }

      await this.db.insertInto("chatroom_files").values(files_cleaned).execute();
    }

    return res;
  }

  async getMessage(message_id: number) {
    return await this.db
      .selectFrom("messages")
      .select(defaultMessageFields)
      .where("id", "=", message_id)
      .executeTakeFirst();
  }

  async getChatroomByID(chatroom_id: number) {
    return await this.db
      .selectFrom("chatrooms")
      .select((eb) => [...defaultChatroomFields, chatroomWithUsers(eb).as("chatroom_users")])
      .where("chatrooms.id", "=", chatroom_id)
      .executeTakeFirst();
  }

  async getChatrooms(opts: { project_id?: number; user_id?: number; keyword?: string }) {
    const { project_id, user_id, keyword } = opts;

    let query = this.db
      .selectFrom("chatrooms")
      .select((eb) => [...defaultChatroomFields, chatroomWithUsers(eb).as("chatroom_users")])
      .orderBy("chatroom_id", "desc");

    if (project_id != undefined) {
      query = query.where("project_id", "=", project_id);
    }
    if (user_id != undefined) {
      query = query.where("chatrooms.id", "in", (eb) =>
        eb.selectFrom("chatrooms_users").select("chatroom_id").where("user_id", "=", user_id),
      );
    }

    if (keyword != undefined) {
      query = query.where("chatrooms.name", "ilike", `%${keyword}%`);
    }

    return await query.execute();
  }

  async addChatroom(opts: { user_ids?: number[]; project_id?: number; chatroom_name: string }) {
    const { project_id, user_ids, chatroom_name } = opts;
    const room_id = await this.db
      .insertInto("chatrooms")
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

  async addChatroomMember(chatroom_id: number, user_id: number) {
    await this.db
      .insertInto("chatrooms_users")
      .values({
        chatroom_id: chatroom_id,
        user_id: user_id,
      })
      .execute();
  }

  async deleteChatroomMember(chatroom_id: number, user_id: number) {
    await this.db
      .deleteFrom("chatrooms_users")
      .where((eb) => eb.and([eb("chatroom_id", "=", chatroom_id), eb("user_id", "=", user_id)]))
      .execute();
  }

  async updateChatroom(chatroom_id: number, opts: { name?: string }) {
    const { name } = opts;
    if (name) {
      await this.db
        .updateTable("chatrooms")
        .set("name", name)
        .where("id", "=", chatroom_id)
        .execute();
    }
  }

  async deleteChatroom(chatroom_id: number) {
    return await this.db.deleteFrom("chatrooms").where("chatrooms.id", "=", chatroom_id).execute();
  }
}
