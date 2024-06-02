import { RequestHandler } from "express";
import { Kysely } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { Application } from "../app.js";
import { DB } from "../db/db_types.js";
import { AuthError, ClientError, NotFoundError } from "../helpers/error.js";
import { RH } from "../helpers/types";
import { validateLogged } from "../helpers/validate.js";
import { Controller, Route } from "./controller.js";
import { parseRole, withMembers } from "./projects.js";

// Manipulasi data semuanya dilakuin lewat http.
// Socket cuma dipakai buat broadcast perubahan ke user.

// Kalau chatroomnya berkaitan dengan projek, validasi pakai daftar member projek.
// Kalau chatroomnya bukan, validasi pakai daftar member chatroom

export class ChatController extends Controller {
  private db: Kysely<DB>;
  private socket_server: import("socket.io").Server;
  constructor(app: Application) {
    super(app);
    this.db = app.db;
    this.socket_server = app.socket_server;
  }

  init() {
    return {
      ProjectsDetailChatroomsPost: new Route({
        handler: this.postProjectsDetailChatrooms,
        method: "post",
        path: "/api/projects/:project_id/chatrooms",
        priors: [validateLogged as RequestHandler],
      }),
      ProjectsDetailChatroomsGet: new Route({
        handler: this.getProjectsDetailChatrooms,
        method: "get",
        path: "/api/projects/:project_id/chatrooms",
      }),
      UsersDetailChatroomsPost: new Route({
        handler: this.postUsersDetailChatrooms,
        method: "post",
        path: "/api/users/:user_id/chatrooms",
        priors: [validateLogged as RequestHandler],
      }),
      UsersDetailChatroomsGet: new Route({
        handler: this.getUsersDetailChatrooms,
        method: "get",
        path: "/api/users/:user_id/chatrooms",
        priors: [validateLogged as RequestHandler],
      }),
      ChatroomsDetailGet: new Route({
        handler: this.getChatroomsDetail,
        method: "get",
        path: "/api/chatrooms/:chatroom_id",
        priors: [validateLogged as RequestHandler],
      }),
      ChatroomsDetailPut: new Route({
        handler: this.putChatroomsDetail,
        method: "put",
        path: "/api/chatrooms/:chatroom_id",
        priors: [validateLogged as RequestHandler],
      }),
      ChatroomsDetailMessagesPost: new Route({
        handler: this.postChatroomsDetailMessages,
        method: "post",
        path: "/api/chatrooms/:chatroom_id/messages",
        priors: [validateLogged as RequestHandler],
      }),
      ChatroomsDetailMessagesGet: new Route({
        handler: this.getChatroomsDetailMessages,
        method: "get",
        path: "/api/chatrooms/:chatroom_id/messages",
        priors: [validateLogged as RequestHandler],
      }),
    };
  }

  private getChatroomMembers = async (chatroom_id: number) => {
    const chatroom = await this.db
      .selectFrom("ms_chatrooms")
      .select("ms_chatrooms.project_id")
      .where("id", "=", chatroom_id)
      .executeTakeFirst();

    if (!chatroom) {
      throw new NotFoundError("Chatroom tidak ditemukan!");
    }

    if (chatroom.project_id === null) {
      const result = await this.db
        .selectFrom("chatrooms_users")
        .select("chatrooms_users.user_id")
        .where("chatroom_id", "=", chatroom_id)
        .execute();

      return result.map((x) => x.user_id);
    } else {
      const result = await this.db
        .selectFrom("ms_projects")
        .select((eb) => withMembers(eb).as("project_members"))
        .where("ms_projects.id", "=", chatroom.project_id)
        .executeTakeFirst();

      if (!result) {
        throw new Error(`Chat ${chatroom_id} merujuk kepada projek invalid!`);
      }
      return result.project_members
        .filter((x) => {
          const role = parseRole(x.role);
          return role === "Dev" || role === "Admin";
        })
        .map((x) => x.id);
    }
  };

  private getChatroomsDetailMessages: RH<{
    Params: {
      chatroom_id: string;
    };
    ResBody: {
      message: string;
      user_id: number;
      created_at: Date;
    }[];
  }> = async (req, res) => {
    const { chatroom_id: chatroom_id_str } = req.params;
    const chatroom_id = Number(chatroom_id_str);
    const user_id = req.session.user_id!;

    const val = await this.getChatroomMembers(chatroom_id);
    if (!val.includes(user_id)) {
      throw new AuthError("Anda tidak memiliki akses untuk membaca chat ini!");
    }

    const result = await this.db
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

  private postChatroomsDetailMessages: RH<{
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
  }> = async (req, res) => {
    const { chatroom_id: chatroom_id_str } = req.params;
    const { message } = req.body;

    if (message.length === 0) {
      throw new ClientError("Pesan tidak boleh kosong!");
    }

    const chatroom_id = Number(chatroom_id_str);
    const user_id = req.session.user_id!;

    const members = await this.getChatroomMembers(chatroom_id);
    if (!members.includes(user_id)) {
      throw new AuthError("Anda tidak memiliki akses untuk membaca chat ini!");
    }

    const ret = await this.db
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

    const socks = await this.socket_server.fetchSockets();
    const filtered = socks.filter((x) => members.includes(x.data.userId));
    filtered.forEach((x) => x.emit("msg", chatroom_id, JSON.stringify(ret)));

    res.status(200).json(ret);
  };

  private getChatroomsDetail: RH<{
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
  }> = async (req, res) => {
    const { chatroom_id: chatroom_id_str } = req.params;
    const chatroom_id = Number(chatroom_id_str);

    const user_id = req.session.user_id!;

    const members = await this.getChatroomMembers(chatroom_id);
    if (!members.includes(user_id)) {
      throw new AuthError("Anda tidak memiliki akses untuk membaca chat ini!");
    }

    const result = await this.db
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

  private getProjectsDetailChatrooms: RH<{
    ResBody: {
      chatroom_id: number;
      chatroom_name: string;
      project_id: number | null;
      chatroom_created_at: Date;
    }[];
    Params: {
      project_id: string;
    };
  }> = async (req, res) => {
    const project_id = req.params.project_id;

    const result = await this.db
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

  private getUsersDetailChatrooms: RH<{
    ResBody: {
      chatroom_id: number;
      chatroom_name: string;
      project_id: number | null;
      chatroom_created_at: Date;
    }[];
    Params: {
      user_id: string;
    };
  }> = async (req, res) => {
    const user_id = req.params.user_id;

    const result = await this.db
      .selectFrom("ms_chatrooms")
      .select([
        "ms_chatrooms.id as chatroom_id",
        "ms_chatrooms.name as chatroom_name",
        "ms_chatrooms.project_id",
        "ms_chatrooms.created_at as chatroom_created_at",
      ])
      .orderBy("chatroom_id", "desc")
      .where("id", "in", (eb) =>
        eb
          .selectFrom("chatrooms_users")
          .select("chatroom_id")
          .where("user_id", "=", Number(user_id)),
      )
      .execute();

    res.json(result);
  };

  private postUsersDetailChatrooms: RH<{
    ResBody: { msg: string };
    ReqBody: { name: string };
    Params: { user_id: string };
  }> = async (req, res) => {
    const name = req.body.name;
    const user_id_str = req.params.user_id;
    const user_id = Number(user_id_str);

    if (name.length === 0) {
      throw new ClientError("Nama chatroom tidak boleh kosong!");
    }

    await this.db.transaction().execute(async (trx) => {
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

    const socks = await this.socket_server.fetchSockets();
    const filtered = socks.filter((x) => user_id === x.data.userId);
    filtered.forEach((x) => x.emit("roomUpdate"));

    res.status(201).json({
      msg: "Room created!",
    });
  };

  private postProjectsDetailChatrooms: RH<{
    ResBody: { msg: string };
    ReqBody: { name: string };
    Params: { project_id: string };
  }> = async (req, res) => {
    const name = req.body.name;
    const project_id = Number(req.params.project_id);

    if (name.length === 0) {
      throw new ClientError("Nama chatroom tidak boleh kosong!");
    }
    const chatroom_id = await this.db
      .insertInto("ms_chatrooms")
      .values({
        name: name,
        project_id: project_id,
      })
      .returning("id")
      .executeTakeFirst();

    if (!chatroom_id) {
      throw new Error("Data chatroom gagal masuk!");
    }

    const members = await this.getChatroomMembers(chatroom_id.id);
    const socks = await this.socket_server.fetchSockets();

    const filtered = socks.filter((x) => members.includes(x.data.userId));
    filtered.forEach((x) => x.emit("roomUpdate"));

    res.status(201).json({
      msg: "Room created!",
    });
  };

  private putChatroomsDetail: RH<{
    ResBody: { msg: string };
    Params: { chatroom_id: string };
    ReqBody: { name?: string; user_ids?: number[] };
  }> = async (req, res) => {
    const { name, user_ids } = req.body;
    const { chatroom_id: chatroom_id_str } = req.params;
    const chatroom_id = Number(chatroom_id_str);

    const old_users = await this.db
      .selectFrom("chatrooms_users")
      .select("user_id")
      .where("chatrooms_users.chatroom_id", "=", chatroom_id)
      .execute();

    const user_id = req.session.user_id!;

    const members = await this.getChatroomMembers(chatroom_id);
    if (!members.includes(user_id)) {
      throw new AuthError("Anda tidak memiliki akses untuk membaca chat ini!");
    }

    if (name) {
      if (name.length === 0) {
        throw new ClientError("Nama chatroom tidak boleh kosong!");
      }
      this.db.updateTable("ms_chatrooms").set("name", name).where("id", "=", chatroom_id).execute();
    }

    if (user_ids) {
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

    const new_users = await this.db
      .selectFrom("chatrooms_users")
      .select("user_id")
      .where("chatrooms_users.chatroom_id", "=", chatroom_id)
      .execute();

    const users_to_notify = [
      ...old_users.map((x) => x.user_id),
      ...new_users.map((x) => x.user_id),
    ];

    const socks = await this.socket_server.fetchSockets();
    const filtered = socks.filter((x) => users_to_notify.includes(x.data.userId));
    filtered.forEach((x) => x.emit("roomUpdate"));

    res.status(200).json({
      msg: "Update successful!",
    });
  };
}
