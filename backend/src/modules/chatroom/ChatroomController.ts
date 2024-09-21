import type { Express } from "express";
import { RequestHandler } from "express";
import { Server } from "socket.io";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller.js";
import { AuthError, ClientError, NotFoundError } from "../../helpers/error.js";
import { RH } from "../../helpers/types.js";
import { validateLogged } from "../../helpers/validate.js";
import { ChatService } from "./ChatroomService.js";

// Manipulasi data semuanya dilakuin lewat http.
// Socket cuma dipakai buat broadcast perubahan ke user.

// Kalau chatroomnya berkaitan dengan projek, validasi pakai daftar member projek.
// Kalau chatroomnya bukan, validasi pakai daftar member chatroom

export class ChatController extends Controller {
  private socket_server: Server;
  private chat_service: ChatService;

  constructor(express_server: Express, socket_server: Server, chat_service: ChatService) {
    super(express_server);
    this.socket_server = socket_server;
    this.chat_service = chat_service;
  }

  init() {
    return {
      ProjectsDetailChatroomsPost: new Route({
        handler: this.postProjectsDetailChatrooms,
        method: "post",
        path: "/api/projects/:project_id/chatrooms",
        priors: [validateLogged as RequestHandler],
        schema: {
          ReqBody: z.object({
            name: z.string({ message: "Nama tidak valid!" }).min(1, "Nama tidak boleh kosong!"),
          }),
          Params: z.object({
            project_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID proyek tidak valid!" }),
          }),
        },
      }),
      ProjectsDetailChatroomsGet: new Route({
        handler: this.getProjectsDetailChatrooms,
        method: "get",
        path: "/api/projects/:project_id/chatrooms",
        schema: {
          Params: z.object({
            project_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID tidak valid!" }),
          }),
        },
      }),
      UsersDetailChatroomsPost: new Route({
        handler: this.postUsersDetailChatrooms,
        method: "post",
        path: "/api/users/:user_id/chatrooms",
        priors: [validateLogged as RequestHandler],
        schema: {
          Params: z.object({
            user_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID tidak valid!" }),
          }),
        },
      }),
      UsersDetailChatroomsGet: new Route({
        handler: this.getUsersDetailChatrooms,
        method: "get",
        path: "/api/users/:user_id/chatrooms",
        priors: [validateLogged as RequestHandler],
        schema: {
          Params: z.object({
            user_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID pengguna tidak valid!" }),
          }),
        },
      }),
      ChatroomsDetailGet: new Route({
        handler: this.getChatroomsDetail,
        method: "get",
        path: "/api/chatrooms/:chatroom_id",
        priors: [validateLogged as RequestHandler],
        schema: {
          Params: z.object({
            chatroom_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID chatroom tidak valid!" }),
          }),
        },
      }),
      ChatroomsDetailPut: new Route({
        handler: this.putChatroomsDetail,
        method: "put",
        path: "/api/chatrooms/:chatroom_id",
        priors: [validateLogged as RequestHandler],
        schema: {
          Params: z.object({
            chatroom_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID chatroom tidak valid!" }),
          }),
          ReqBody: z.object({
            name: z.string({ message: "Nama invalid!" }).min(1).optional(),
            user_ids: z.array(z.number(), { message: "ID pengguna invalid!" }).optional(),
          }),
        },
      }),
      ChatroomsDetailDelete: new Route({
        handler: this.deleteChatroomsDetail,
        method: "delete",
        path: "/api/chatrooms/:chatroom_id",
        priors: [validateLogged as RequestHandler],
        schema: {
          Params: z.object({
            chatroom_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID chatroom tidak valid!" }),
          }),
        },
      }),
      ChatroomsDetailMessagesPost: new Route({
        handler: this.postChatroomsDetailMessages,
        method: "post",
        path: "/api/chatrooms/:chatroom_id/messages",
        priors: [validateLogged as RequestHandler],
        schema: {
          Params: z.object({
            chatroom_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID chatroom tidak valid!" }),
          }),
          ReqBody: z.object({
            message: z
              .string({ message: "Isi pesan tidak valid!" })
              .min(1, "Pesan tidak boleh kosong!"),
          }),
        },
      }),
      ChatroomsDetailMessagesPut: new Route({
        handler: this.putChatroomsDetailMessages,
        method: "put",
        path: "/api/chatrooms/:chatroom_id/messages/:message_id",
        priors: [validateLogged as RequestHandler],
        schema: {
          Params: z.object({
            chatroom_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID chatroom tidak valid!" }),
            message_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID pesan tidak valid!" }),
          }),
          ReqBody: z.object({
            message: z
              .string({ message: "Isi pesan tidak valid!" })
              .min(1, "Pesan tidak boleh kosong!"),
          }),
        },
      }),
      ChatroomsDetailMessagesGet: new Route({
        handler: this.getChatroomsDetailMessages,
        method: "get",
        path: "/api/chatrooms/:chatroom_id/messages",
        priors: [validateLogged as RequestHandler],
        schema: {
          Params: z.object({
            chatroom_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID chatroom tidak valid!" }),
          }),
        },
      }),
    };
  }

  private getChatroomsDetailMessages: RH<{
    Params: {
      chatroom_id: string;
    };
    ResBody: {
      id: number;
      message: string;
      user_id: number;
      created_at: Date;
      is_edited: boolean;
    }[];
  }> = async (req, res) => {
    const { chatroom_id: chatroom_id_str } = req.params;
    const chatroom_id = Number(chatroom_id_str);
    const user_id = req.session.user_id!;

    const val = await this.chat_service.isAllowed(chatroom_id, user_id);
    if (!val) {
      throw new AuthError("Anda tidak memiliki akses untuk membaca chat ini!");
    }

    const result = await this.chat_service.getMessages(chatroom_id);

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
      id: number;
      message: string;
      user_id: number;
      created_at: Date;
    };
  }> = async (req, res) => {
    const { chatroom_id: chatroom_id_str } = req.params;
    const { message } = req.body;
    const chatroom_id = Number(chatroom_id_str);
    const user_id = req.session.user_id!;

    if (message.length === 0) {
      throw new ClientError("Pesan tidak boleh kosong!");
    }

    const val = await this.chat_service.isAllowed(chatroom_id, user_id);
    if (!val) {
      throw new AuthError("Anda tidak memiliki akses untuk mengirim ke chat ini!");
    }

    const ret = await this.chat_service.sendMessage(chatroom_id, user_id, message);

    if (!ret) {
      throw new Error("Pesan tidak terkirim!");
    }

    const members = await this.chat_service.getMembers(chatroom_id);

    const socks = await this.socket_server.fetchSockets();
    const filtered = socks.filter((x) => members.includes(x.data.userId));
    filtered.forEach((x) => x.emit("msg", chatroom_id, JSON.stringify(ret)));

    res.status(201).json(ret);
  };

  private putChatroomsDetailMessages: RH<{
    Params: {
      chatroom_id: string;
      message_id: string;
    };
    ReqBody: {
      message: string;
    };
    ResBody: {
      id: number;
      message: string;
      user_id: number;
      created_at: Date;
    };
  }> = async (req, res) => {
    const { chatroom_id: chatroom_id_str, message_id: message_id_str } = req.params;
    const { message } = req.body;
    const chatroom_id = Number(chatroom_id_str);
    const message_id = Number(message_id_str);
    const user_id = req.session.user_id!;

    if (message.length === 0) {
      throw new ClientError("Pesan tidak boleh kosong!");
    }

    const val = await this.chat_service.isAllowed(chatroom_id, user_id);
    if (!val) {
      throw new AuthError("Anda tidak memiliki akses untuk mengirim ke chat ini!");
    }

    const old_message = await this.chat_service.getMessage(message_id);
    if (!old_message) {
      throw new NotFoundError("Pesan tidak ditemukan!");
    }

    if (old_message.user_id !== user_id) {
      throw new AuthError("Anda tidak memiliki akses untuk mengubah pesan ini!");
    }

    const ret = await this.chat_service.updateMessage(message_id, { message });

    if (!ret) {
      throw new Error("Pesan tidak terkirim!");
    }

    const members = await this.chat_service.getMembers(chatroom_id);

    const socks = await this.socket_server.fetchSockets();
    const filtered = socks.filter((x) => members.includes(x.data.userId));
    filtered.forEach((x) => x.emit("msgUpd", chatroom_id, JSON.stringify(ret)));

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
      }[];
    };
  }> = async (req, res) => {
    const { chatroom_id: chatroom_id_str } = req.params;
    const chatroom_id = Number(chatroom_id_str);

    const user_id = req.session.user_id!;

    const val = await this.chat_service.isAllowed(chatroom_id, user_id);
    if (!val) {
      throw new AuthError("Anda tidak memiliki akses untuk membaca chat ini!");
    }

    const result = await this.chat_service.getChatroomByID(chatroom_id);
    res.status(200).json(result);
  };

  private getProjectsDetailChatrooms: RH<{
    ResBody: {
      project_id: number | null;
      chatroom_id: number;
      chatroom_name: string;
      chatroom_created_at: Date;
      chatroom_users: {
        user_id: number;
      }[];
    }[];
    Params: {
      project_id: string;
    };
  }> = async (req, res) => {
    const project_id = req.params.project_id;
    const result = await this.chat_service.getProjectChatrooms(Number(project_id));
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
    const result = await this.chat_service.getUserChatrooms(Number(user_id));
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

    await this.chat_service.addUserChatroom(user_id, name);

    const socks = await this.socket_server.fetchSockets();
    const filtered = socks.filter((x) => user_id === x.data.userId);
    filtered.forEach((x) => x.emit("roomUpdate"));

    res.status(201).json({
      msg: "Room created!",
    });
  };

  private postProjectsDetailChatrooms: RH<{
    ResBody: {
      project_id: number | null;
      chatroom_id: number;
      chatroom_name: string;
      chatroom_created_at: Date;
      chatroom_users: {
        user_id: number;
      }[];
    };
    ReqBody: { name: string };
    Params: { project_id: string };
  }> = async (req, res) => {
    const name = req.body.name;
    const project_id = Number(req.params.project_id);

    if (name.length === 0) {
      throw new ClientError("Nama chatroom tidak boleh kosong!");
    }

    const chatroom_id = await this.chat_service.addProjectChatroom(project_id, name);

    if (!chatroom_id) {
      throw new Error("Chatroom gagal untuk dibuat!");
    }

    const members = await this.chat_service.getMembers(chatroom_id.id);
    const socks = await this.socket_server.fetchSockets();

    const filtered = socks.filter((x) => members.includes(x.data.userId));
    filtered.forEach((x) => x.emit("roomUpdate"));

    const chatroom_data = await this.chat_service.getChatroomByID(chatroom_id.id);
    if (!chatroom_data) {
      throw new Error("Chatroom gagal untuk dibuat!");
    }

    res.status(201).json(chatroom_data);
  };

  private putChatroomsDetail: RH<{
    ResBody: { msg: string };
    Params: { chatroom_id: string };
    ReqBody: { name?: string; user_ids?: number[] };
  }> = async (req, res) => {
    const { name, user_ids } = req.body;
    const { chatroom_id: chatroom_id_str } = req.params;
    const chatroom_id = Number(chatroom_id_str);
    const user_id = req.session.user_id!;

    const val = await this.chat_service.isAllowed(chatroom_id, user_id);
    if (!val) {
      throw new AuthError("Anda tidak memiliki akses untuk membaca chat ini!");
    }

    const old_members = await this.chat_service.getMembers(chatroom_id);
    await this.chat_service.updateChatroom(chatroom_id, name, user_ids);
    const new_members = await this.chat_service.getMembers(chatroom_id);

    const users_to_notify = [...old_members.map((x) => x), ...new_members.map((x) => x)];

    const socks = await this.socket_server.fetchSockets();
    const filtered = socks.filter((x) => users_to_notify.includes(x.data.userId));
    filtered.forEach((x) => x.emit("roomUpdate"));

    res.status(200).json({
      msg: "Update successful!",
    });
  };

  private deleteChatroomsDetail: RH<{
    ResBody: { msg: string };
    Params: { chatroom_id: string };
  }> = async (req, res) => {
    const { chatroom_id: chatroom_id_str } = req.params;
    const chatroom_id = Number(chatroom_id_str);
    const user_id = req.session.user_id!;

    const val = await this.chat_service.isAllowed(chatroom_id, user_id);
    if (!val) {
      throw new AuthError("Anda tidak memiliki akses untuk membaca chat ini!");
    }

    const members = await this.chat_service.getMembers(chatroom_id);
    await this.chat_service.deleteChatroom(chatroom_id);

    const socks = await this.socket_server.fetchSockets();
    const filtered = socks.filter((x) => members.includes(x.data.userId));
    filtered.forEach((x) => x.emit("roomUpdate"));

    res.status(200).json({
      msg: "Delete successful!",
    });
  };
}
