import { ExpressionBuilder, Kysely } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { DB } from "../../db/db_types.js";

const defaultChatroomFields = [
  "ms_chatrooms.id as chatroom_id",
  "ms_chatrooms.name as chatroom_name",
  "ms_chatrooms.project_id",
  "ms_chatrooms.created_at as chatroom_created_at",
] as const;

const defaultMessageFields = [
  "ms_messages.id as id",
  "ms_messages.message as message",
  "ms_messages.created_at as created_at",
  "ms_messages.user_id as user_id",
  "ms_messages.is_edited as is_edited",
] as const;

function chatroomWithUsers(eb: ExpressionBuilder<DB, "ms_chatrooms">) {
  return jsonArrayFrom(
    eb
      .selectFrom("chatrooms_users")
      .select("chatrooms_users.user_id")
      .whereRef("chatrooms_users.chatroom_id", "=", "ms_chatrooms.id"),
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

  async getMessages(chatroom_id: number) {
    return await this.db
      .selectFrom("ms_messages")
      .select(defaultMessageFields)
      .where("ms_messages.chatroom_id", "=", chatroom_id)
      .orderBy("id asc")
      .execute();
  }

  async addMessage(chatroom_id: number, sender_id: number, message: string, is_edited?: boolean) {
    return await this.db
      .insertInto("ms_messages")
      .values({
        chatroom_id: chatroom_id,
        message: message,
        user_id: sender_id,
        is_edited,
      })
      .returning(["id", "message", "user_id", "created_at", "is_edited"])
      .executeTakeFirst();
  }

  async updateMessage(
    message_id: number,
    obj: { chatroom_id?: number; sender_id?: number; message?: string; is_edited?: boolean },
  ) {
    const { chatroom_id, sender_id, message, is_edited } = obj;
    if (
      chatroom_id == undefined &&
      sender_id == undefined &&
      message == undefined &&
      is_edited == undefined
    ) {
      return;
    }
    return await this.db
      .updateTable("ms_messages")
      .set({
        chatroom_id: chatroom_id,
        message: message,
        user_id: sender_id,
        is_edited,
      })
      .where("id", "=", message_id)
      .returning(["id", "message", "user_id", "created_at", "is_edited"])
      .executeTakeFirst();
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

  async getProjectChatrooms(project_id: number) {
    return await this.db
      .selectFrom("ms_chatrooms")
      .select((eb) => [...defaultChatroomFields, chatroomWithUsers(eb).as("chatroom_users")])
      .orderBy("chatroom_id", "desc")
      .where("project_id", "=", project_id)
      .execute();
  }

  async getUserChatrooms(user_id: number) {
    return await this.db
      .selectFrom("ms_chatrooms")
      .select((eb) => [...defaultChatroomFields, chatroomWithUsers(eb).as("chatroom_users")])
      .orderBy("chatroom_id", "desc")
      .where("ms_chatrooms.id", "in", (eb) =>
        eb.selectFrom("chatrooms_users").select("chatroom_id").where("user_id", "=", user_id),
      )
      .execute();
  }

  async addUserChatroom(user_id: number, chatroom_name: string) {
    await this.db.transaction().execute(async (trx) => {
      const room_id = await trx
        .insertInto("ms_chatrooms")
        .values({
          name: chatroom_name,
        })
        .returning(["id"])
        .executeTakeFirst();

      if (!room_id) {
        throw new Error("Data not inserted!");
      }

      await trx
        .insertInto("chatrooms_users")
        .values({
          chatroom_id: room_id.id,
          user_id: user_id,
        })
        .execute();

      return room_id.id;
    });
  }

  async addProjectChatroom(project_id: number, chatroom_name: string) {
    return await this.db
      .insertInto("ms_chatrooms")
      .values({
        name: chatroom_name,
        project_id: project_id,
      })
      .returning("id")
      .executeTakeFirst();
  }

  async updateChatroom(chatroom_id: number, name?: string, user_ids?: number[]) {
    if (name) {
      await this.db
        .updateTable("ms_chatrooms")
        .set("name", name)
        .where("id", "=", chatroom_id)
        .execute();
    }

    if (user_ids != undefined) {
      await this.db.transaction().execute(async (trx) => {
        await trx.deleteFrom("chatrooms_users").where("chatroom_id", "=", chatroom_id).execute();

        if (user_ids.length) {
          await trx
            .insertInto("chatrooms_users")
            .values(
              user_ids.map((user_id) => ({
                chatroom_id: chatroom_id,
                user_id: user_id,
              })),
            )
            .execute();
        }
      });
    }
  }

  async deleteChatroom(chatroom_id: number) {
    return await this.db
      .deleteFrom("ms_chatrooms")
      .where("ms_chatrooms.id", "=", chatroom_id)
      .execute();
  }
}
