import type { Express } from "express";
import { RequestHandler } from "express";
import { Server } from "socket.io";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller.js";
import { AuthError, ClientError } from "../../helpers/error.js";
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
      ProjectsDetailChatroomsPost: this.ProjectsDetailChatroomsPost,
      ProjectsDetailChatroomsGet: this.ProjectsDetailChatroomsGet,
      UsersDetailChatroomsPost: this.UsersDetailChatroomsPost,
      UsersDetailChatroomsGet: this.UsersDetailChatroomsGet,
      ChatroomsDetailGet: this.ChatroomsDetailGet,
      ChatroomsDetailPut: this.ChatroomsDetailPut,
      ChatroomsDetailDelete: this.ChatroomsDetailDelete,
      ChatroomsDetailMessagesPost: this.ChatroomsDetailMessagesPost,
      ChatroomsDetailMessagesPut: this.ChatroomsDetailMessagesPut,
      ChatroomsDetailMessagesGet: this.ChatroomsDetailMessagesGet,
    };
  }

  private async broadcastEvent(user_ids: number[], event: string, ...args: unknown[]) {
    const socks = await this.socket_server.fetchSockets();

    const filtered = socks.filter((x) => user_ids.includes(x.data.userId));
    filtered.forEach((x) => x.emit(event, ...args));
  }

  ProjectsDetailChatroomsPost = new Route({
    handler: async (req, res) => {
      const name = req.body.name;
      const project_id = Number(req.params.project_id);
      const sender_id = Number(req.session.user_id);

      if (name.length === 0) {
        throw new ClientError("Nama chatroom tidak boleh kosong!");
      }

      const chatroom_id = await this.chat_service.addProjectChatroom(project_id, name, sender_id);

      if (!chatroom_id) {
        throw new Error("Chatroom gagal untuk dibuat!");
      }

      const members = await this.chat_service.getAllowedListeners(chatroom_id.id);
      await this.broadcastEvent(members, "roomUpdate");

      const chatroom_data = await this.chat_service.getChatroomByID(chatroom_id.id);
      if (!chatroom_data) {
        throw new Error("Chatroom gagal untuk dibuat!");
      }

      res.status(201).json(chatroom_data);
    },
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
  });
  ProjectsDetailChatroomsGet = new Route({
    handler: async (req, res) => {
      const project_id = req.params.project_id;
      const result = await this.chat_service.getProjectChatrooms(Number(project_id));
      res.json(result);
    },
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
  });
  UsersDetailChatroomsPost = new Route({
    handler: async (req, res) => {
      const name = req.body.name;
      const user_id_str = req.params.user_id;
      const user_id = Number(user_id_str);
      const sender_id = Number(req.session.user_id);

      if (name.length === 0) {
        throw new ClientError("Nama chatroom tidak boleh kosong!");
      }

      const chatroom_id = await this.chat_service.addUserChatroom(user_id, name, sender_id);

      const members = await this.chat_service.getAllowedListeners(chatroom_id);
      await this.broadcastEvent(members, "roomUpdate");

      res.status(201).json({
        msg: "Room created!",
      });
    },
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
  });
  UsersDetailChatroomsGet = new Route({
    handler: async (req, res) => {
      const user_id = req.params.user_id;
      const result = await this.chat_service.getUserChatrooms(Number(user_id));
      res.json(result);
    },
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
  });
  ChatroomsDetailGet = new Route({
    handler: async (req, res) => {
      const { chatroom_id: chatroom_id_str } = req.params;
      const chatroom_id = Number(chatroom_id_str);

      const user_id = req.session.user_id!;

      const val = await this.chat_service.isAllowed(chatroom_id, user_id);
      if (!val) {
        throw new AuthError("Anda tidak memiliki akses untuk membaca chat ini!");
      }

      const result = await this.chat_service.getChatroomByID(chatroom_id);
      res.status(200).json(result);
    },
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
  });
  ChatroomsDetailPut = new Route({
    handler: async (req, res) => {
      const { name, user_ids } = req.body;
      const { chatroom_id: chatroom_id_str } = req.params;
      const chatroom_id = Number(chatroom_id_str);
      const sender_id = req.session.user_id!;

      const old_members = await this.chat_service.getAllowedListeners(chatroom_id);
      await this.chat_service.updateChatroom(chatroom_id, { name, user_ids }, sender_id);
      const new_members = await this.chat_service.getAllowedListeners(chatroom_id);

      const users_to_notify = [...old_members, ...new_members];

      await this.broadcastEvent(users_to_notify, "roomUpdate");

      res.status(200).json({
        msg: "Update successful!",
      });
    },
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
  });
  ChatroomsDetailDelete = new Route({
    handler: async (req, res) => {
      const { chatroom_id: chatroom_id_str } = req.params;
      const chatroom_id = Number(chatroom_id_str);
      const sender_id = req.session.user_id!;

      const members = await this.chat_service.getAllowedListeners(chatroom_id);
      await this.chat_service.deleteChatroom(chatroom_id, sender_id);

      await this.broadcastEvent(members, "roomUpdate");

      res.status(200).json({
        msg: "Delete successful!",
      });
    },
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
  });
  ChatroomsDetailMessagesPost = new Route({
    handler: async (req, res) => {
      const { chatroom_id: chatroom_id_str } = req.params;
      const { message } = req.body;
      const chatroom_id = Number(chatroom_id_str);
      const user_id = req.session.user_id!;

      if (message.length === 0) {
        throw new ClientError("Pesan tidak boleh kosong!");
      }

      const ret = await this.chat_service.sendMessage(chatroom_id, user_id, message);

      if (!ret) {
        throw new Error("Pesan tidak terkirim!");
      }

      const members = await this.chat_service.getAllowedListeners(chatroom_id);
      await this.broadcastEvent(members, "msg", chatroom_id, JSON.stringify(ret));

      res.status(201).json(ret);
    },
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
  });
  ChatroomsDetailMessagesPut = new Route({
    handler: async (req, res) => {
      const { chatroom_id: chatroom_id_str, message_id: message_id_str } = req.params;
      const { message } = req.body;
      const chatroom_id = Number(chatroom_id_str);
      const message_id = Number(message_id_str);
      const user_id = req.session.user_id!;

      if (message.length === 0) {
        throw new ClientError("Pesan tidak boleh kosong!");
      }

      const ret = await this.chat_service.updateMessage(message_id, { message }, user_id);

      if (!ret) {
        throw new Error("Pesan tidak terkirim!");
      }

      const members = await this.chat_service.getAllowedListeners(chatroom_id);
      await this.broadcastEvent(members, "msgUpd", chatroom_id, JSON.stringify(ret));

      res.status(200).json(ret);
    },
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
  });
  ChatroomsDetailMessagesGet = new Route({
    handler: async (req, res) => {
      const { chatroom_id: chatroom_id_str } = req.params;
      const chatroom_id = Number(chatroom_id_str);
      const user_id = req.session.user_id!;

      const val = await this.chat_service.isAllowed(chatroom_id, user_id);
      if (!val) {
        throw new AuthError("Anda tidak memiliki akses untuk membaca chat ini!");
      }

      const result = await this.chat_service.getMessages(chatroom_id);

      res.status(200).json(result);
    },
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
  });
}
