import { Request } from "express";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { Server, Socket } from "socket.io";
import { db } from "../db/db";
import { ClientError } from "../helpers/error";
import { RH } from "../helpers/types";

type ServerToClientEvents = {
  roomEdit: () => void;
  msgAcc: (room_id: number, msg_obj_json: string) => void;
};

type ClientToServerEvents = {
  roomEdit: (room_id: number) => void;
  msgPend: (room_id: number, msg: string) => void;
};

type SocketData = {
  userId: number;
};

export async function registerSocket(
  io: Server<ClientToServerEvents, ServerToClientEvents, never, SocketData>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents, never, SocketData>,
) {
  const request = socket.request as Request;

  if (!request.session.user_id) {
    socket.disconnect();
    return;
  }

  const userId = request.session.user_id;
  socket.data.userId = userId;

  const chatrooms = await db
    .selectFrom("chatrooms_users")
    .select("chatroom_id")
    .where("user_id", "=", userId)
    .execute();

  socket.join(chatrooms.map((x) => x.chatroom_id.toString()));

  socket.on("roomEdit", async (id) => {
    const users = await db
      .selectFrom("chatrooms_users")
      .select("user_id")
      .where("chatroom_id", "=", id)
      .execute();
    const user_ids = users.map((x) => x.user_id);

    const socks = await io.fetchSockets();
    const affectedSocks = socks.filter((x) => user_ids.includes(x.data.userId));
    affectedSocks.forEach((x) => x.emit("roomEdit"));
  });

  socket.on("msgPend", async (room_id: number | null, msg: string | null) => {
    if (room_id == null || msg == null) {
      return;
    }
    if (msg.length === 0) {
      return;
    }

    await db
      .insertInto("ms_messages")
      .values({
        chatroom_id: room_id,
        message: msg,
        users_id: userId,
      })
      .execute();

    io.to(room_id.toString()).emit(
      "msgAcc",
      room_id,
      JSON.stringify({
        message: msg,
        user_id: request.session.user_id,
        created_at: new Date(),
      }),
    );
  });
}

export const getChatroomDetail: RH<{
  Params: {
    chatroom_id: string;
  };
  ResBody: {
    chatroom_id: number;
    chatroom_name: string;
    project_id: number | null;
    chatroom_created_at: Date;
    chatroom_users: {
      user_id: number;
      user_name: string;
    }[];
    chatroom_messages: {
      message: string;
      user_id: number;
      created_at: Date;
    }[];
  };
}> = async function (req, res) {
  const { chatroom_id: chatroom_id_str } = req.params;
  const chatroom_id = Number(chatroom_id_str);

  const result = await db
    .selectFrom("ms_chatrooms")
    .select((eb) => [
      "ms_chatrooms.id as chatroom_id",
      "ms_chatrooms.name as chatroom_name",
      "ms_chatrooms.project_id",
      "ms_chatrooms.created_at as chatroom_created_at",
      jsonArrayFrom(
        eb
          .selectFrom("chatrooms_users")
          .innerJoin("ms_users", "chatrooms_users.user_id", "ms_users.id")
          .select(["ms_users.id as user_id", "ms_users.name as user_name"])
          .whereRef("chatrooms_users.chatroom_id", "=", "ms_chatrooms.id"),
      ).as("chatroom_users"),
      jsonArrayFrom(
        eb
          .selectFrom("ms_messages")
          .select([
            "ms_messages.message as message",
            "ms_messages.created_at as created_at",
            "ms_messages.users_id as user_id",
          ])
          .whereRef("ms_messages.chatroom_id", "=", "ms_chatrooms.id"),
      ).as("chatroom_messages"),
    ])
    .where("ms_chatrooms.id", "=", chatroom_id)
    .executeTakeFirst();

  res.status(200).json(result);
};

export const getChatrooms: RH<{
  ResBody: {
    chatroom_id: number;
    chatroom_name: string;
    project_id: number | null;
    chatroom_created_at: Date;
  }[];
}> = async function (req, res) {
  const user_id = req.session.user_id!;

  const result = await db
    .selectFrom("ms_chatrooms")
    .select([
      "ms_chatrooms.id as chatroom_id",
      "ms_chatrooms.name as chatroom_name",
      "ms_chatrooms.project_id",
      "ms_chatrooms.created_at as chatroom_created_at",
    ])
    .where("id", "in", (eb) =>
      eb.selectFrom("chatrooms_users").select("chatroom_id").where("user_id", "=", user_id),
    )
    .execute();

  res.json(result);
};

export const postChatrooms: RH<{
  ResBody: { msg: string };
  ReqBody: { project_id?: number; name: string; user_ids: number[] };
}> = async function (req, res) {
  const { project_id, name, user_ids } = req.body;

  if (name.length === 0) {
    throw new ClientError("Nama chatroom tidak boleh kosong!");
  }

  await db.transaction().execute(async (trx) => {
    const room = await trx
      .insertInto("ms_chatrooms")
      .values({
        name: name,
        ...(project_id ? { project_id } : {}),
      })
      .returning(["id"])
      .executeTakeFirst();

    if (!room) {
      throw new Error("Data not inserted!");
    }

    await trx
      .insertInto("chatrooms_users")
      .values(
        user_ids.map((user_id) => ({
          chatroom_id: room.id,
          user_id: user_id,
        })),
      )
      .execute();
  });

  res.status(201).json({
    msg: "Room created!",
  });
};

export const putChatroom: RH<{
  ResBody: { msg: string };
  Params: { chatroom_id: string };
  ReqBody: { name?: string; user_ids?: number[] };
}> = async function (req, res) {
  const { name, user_ids } = req.body;
  const { chatroom_id: chatroom_id_str } = req.params;
  const chatroom_id = Number(chatroom_id_str);

  if (name) {
    if (name.length === 0) {
      throw new ClientError("Nama chatroom tidak boleh kosong!");
    }
    db.updateTable("ms_chatrooms").set("name", name).where("id", "=", chatroom_id).execute();
  }

  if (user_ids) {
    await db.transaction().execute(async (trx) => {
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

  res.status(200).json({
    msg: "Update successful!",
  });
};
