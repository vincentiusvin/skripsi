import { jsonArrayFrom } from "kysely/helpers/postgres";
import { Application } from "../app.js";
import { db } from "../db/db";
import { AuthError, ClientError, NotFoundError } from "../helpers/error";
import { RH } from "../helpers/types";
import { getProjectMembers } from "./projects";

// Manipulasi data semuanya dilakuin lewat http.
// Socket cuma dipakai buat broadcast perubahan ke user.

// Kalau chatroomnya berkaitan dengan projek, validasi pakai daftar member projek.
// Kalau chatroomnya bukan, validasi pakai daftar member chatroom
export async function getChatroomMembers(chatroom_id: number) {
  const chatroom = await db
    .selectFrom("ms_chatrooms")
    .select("ms_chatrooms.project_id")
    .where("id", "=", chatroom_id)
    .executeTakeFirst();

  if (!chatroom) {
    throw new NotFoundError("Chatroom tidak ditemukan!");
  }

  if (chatroom.project_id === null) {
    const result = await db
      .selectFrom("chatrooms_users")
      .select("chatrooms_users.user_id")
      .where("chatroom_id", "=", chatroom_id)
      .execute();

    return result.map((x) => x.user_id);
  } else {
    const result = await getProjectMembers(chatroom.project_id);
    return [...result.org_members, ...result.project_devs];
  }
}

export const getChatroomsDetailMessages: RH<{
  Params: {
    chatroom_id: string;
  };
  ResBody: {
    message: string;
    user_id: number;
    created_at: Date;
  }[];
}> = async function (req, res) {
  const { chatroom_id: chatroom_id_str } = req.params;
  const chatroom_id = Number(chatroom_id_str);
  const user_id = req.session.user_id!;

  const val = await getChatroomMembers(chatroom_id);
  if (!val.includes(user_id)) {
    throw new AuthError("Anda tidak memiliki akses untuk membaca chat ini!");
  }

  const result = await db
    .selectFrom("ms_messages")
    .select([
      "ms_messages.message as message",
      "ms_messages.created_at as created_at",
      "ms_messages.user_id as user_id",
    ])
    .where("ms_messages.chatroom_id", "=", chatroom_id)
    .execute();

  res.status(200).json(result);
};

export const postChatroomsDetailMessages: RH<{
  Params: {
    chatroom_id: string;
  };
  ReqBody: {
    message: string;
  };
  ResBody: {
    message: string;
    user_id: number;
    created_at: Date;
  };
}> = async function (req, res) {
  const { chatroom_id: chatroom_id_str } = req.params;
  const { message } = req.body;

  if (message.length === 0) {
    throw new ClientError("Pesan tidak boleh kosong!");
  }

  const chatroom_id = Number(chatroom_id_str);
  const user_id = req.session.user_id!;

  const members = await getChatroomMembers(chatroom_id);
  if (!members.includes(user_id)) {
    throw new AuthError("Anda tidak memiliki akses untuk membaca chat ini!");
  }

  const ret = await db
    .insertInto("ms_messages")
    .values({
      chatroom_id: chatroom_id,
      message: message,
      user_id: user_id,
    })
    .returning(["message", "user_id", "created_at"])
    .executeTakeFirst();

  if (!ret) {
    throw new Error("Pesan tidak terkirim!");
  }

  const socket_server = Application.getApplication().socket_server;
  const socks = await socket_server.fetchSockets();
  const filtered = socks.filter((x) => members.includes(x.data.userId));
  filtered.forEach((x) => x.emit("msg", chatroom_id, JSON.stringify(ret)));

  res.status(200).json(ret);
};

export const getChatroomsDetail: RH<{
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
  };
}> = async function (req, res) {
  const { chatroom_id: chatroom_id_str } = req.params;
  const chatroom_id = Number(chatroom_id_str);

  const user_id = req.session.user_id!;

  const members = await getChatroomMembers(chatroom_id);
  if (!members.includes(user_id)) {
    throw new AuthError("Anda tidak memiliki akses untuk membaca chat ini!");
  }

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
    ])
    .where("ms_chatrooms.id", "=", chatroom_id)
    .executeTakeFirst();

  res.status(200).json(result);
};

export const getProjectsDetailChatrooms: RH<{
  ResBody: {
    chatroom_id: number;
    chatroom_name: string;
    project_id: number | null;
    chatroom_created_at: Date;
  }[];
  Params: {
    project_id: string;
  };
}> = async function (req, res) {
  const project_id = req.params.project_id;

  const result = await db
    .selectFrom("ms_chatrooms")
    .select([
      "ms_chatrooms.id as chatroom_id",
      "ms_chatrooms.name as chatroom_name",
      "ms_chatrooms.project_id",
      "ms_chatrooms.created_at as chatroom_created_at",
    ])
    .orderBy("chatroom_id", "desc")
    .where("project_id", "=", Number(project_id))
    .execute();

  res.json(result);
};

export const getUsersDetailChatrooms: RH<{
  ResBody: {
    chatroom_id: number;
    chatroom_name: string;
    project_id: number | null;
    chatroom_created_at: Date;
  }[];
  Params: {
    user_id: string;
  };
}> = async function (req, res) {
  const user_id = req.params.user_id;

  const result = await db
    .selectFrom("ms_chatrooms")
    .select([
      "ms_chatrooms.id as chatroom_id",
      "ms_chatrooms.name as chatroom_name",
      "ms_chatrooms.project_id",
      "ms_chatrooms.created_at as chatroom_created_at",
    ])
    .orderBy("chatroom_id", "desc")
    .where("id", "in", (eb) =>
      eb.selectFrom("chatrooms_users").select("chatroom_id").where("user_id", "=", Number(user_id)),
    )
    .execute();

  res.json(result);
};

export const postUsersDetailChatrooms: RH<{
  ResBody: { msg: string };
  ReqBody: { name: string };
  Params: { user_id: string };
}> = async function (req, res) {
  const name = req.body.name;
  const user_id_str = req.params.user_id;
  const user_id = Number(user_id_str);

  if (name.length === 0) {
    throw new ClientError("Nama chatroom tidak boleh kosong!");
  }

  await db.transaction().execute(async (trx) => {
    const room = await trx
      .insertInto("ms_chatrooms")
      .values({
        name: name,
      })
      .returning(["id"])
      .executeTakeFirst();

    if (!room) {
      throw new Error("Data not inserted!");
    }

    await trx
      .insertInto("chatrooms_users")
      .values({
        chatroom_id: room.id,
        user_id: user_id,
      })
      .execute();
  });

  const socket_server = Application.getApplication().socket_server;
  const socks = await socket_server.fetchSockets();
  const filtered = socks.filter((x) => user_id === x.data.userId);
  filtered.forEach((x) => x.emit("roomUpdate"));

  res.status(201).json({
    msg: "Room created!",
  });
};

export const postProjectsDetailChatrooms: RH<{
  ResBody: { msg: string };
  ReqBody: { name: string };
  Params: { project_id: string };
}> = async function (req, res) {
  const name = req.body.name;
  const project_id = Number(req.params.project_id);

  if (name.length === 0) {
    throw new ClientError("Nama chatroom tidak boleh kosong!");
  }
  await db
    .insertInto("ms_chatrooms")
    .values({
      name: name,
      project_id: project_id,
    })
    .execute();

  const members = await getProjectMembers(project_id);
  const socket_server = Application.getApplication().socket_server;
  const socks = await socket_server.fetchSockets();

  const filtered = socks.filter(
    (x) =>
      members.org_members.includes(x.data.userId) || members.project_devs.includes(x.data.userId),
  );
  filtered.forEach((x) => x.emit("roomUpdate"));

  res.status(201).json({
    msg: "Room created!",
  });
};

export const putChatroomsDetail: RH<{
  ResBody: { msg: string };
  Params: { chatroom_id: string };
  ReqBody: { name?: string; user_ids?: number[] };
}> = async function (req, res) {
  const { name, user_ids } = req.body;
  const { chatroom_id: chatroom_id_str } = req.params;
  const chatroom_id = Number(chatroom_id_str);

  const old_users = await db
    .selectFrom("chatrooms_users")
    .select("user_id")
    .where("chatrooms_users.chatroom_id", "=", chatroom_id)
    .execute();

  const user_id = req.session.user_id!;

  const members = await getChatroomMembers(chatroom_id);
  if (!members.includes(user_id)) {
    throw new AuthError("Anda tidak memiliki akses untuk membaca chat ini!");
  }

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

  const new_users = await db
    .selectFrom("chatrooms_users")
    .select("user_id")
    .where("chatrooms_users.chatroom_id", "=", chatroom_id)
    .execute();

  const users_to_notify = [...old_users.map((x) => x.user_id), ...new_users.map((x) => x.user_id)];

  const socket_server = Application.getApplication().socket_server;
  const socks = await socket_server.fetchSockets();
  const filtered = socks.filter((x) => users_to_notify.includes(x.data.userId));
  filtered.forEach((x) => x.emit("roomUpdate"));

  res.status(200).json({
    msg: "Update successful!",
  });
};
