import type { Express } from "express";
import { Server } from "socket.io";
import { EventNames, EventParams } from "socket.io/dist/typed-events.js";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller.js";
import { AuthError, ClientError, NotFoundError } from "../../helpers/error.js";
import { validateLogged } from "../../helpers/validate.js";
import { defaultError, zodStringReadableAsNumber } from "../../helpers/validators.js";
import { ServerToClientEvents, ServerType } from "../../sockets.js";
import { ChatService } from "./ChatroomService.js";

// Manipulasi data semuanya dilakuin lewat http.
// Socket cuma dipakai buat broadcast perubahan ke user.

// Kalau chatroomnya berkaitan dengan projek, validasi pakai daftar member projek.
// Kalau chatroomnya bukan, validasi pakai daftar member chatroom

const MessageResponseSchema = z.object({
  id: z.number(),
  message: z.string(),
  created_at: z.date(),
  user_id: z.number(),
  is_edited: z.boolean(),
  files: z
    .object({
      id: z.number(),
      filename: z.string(),
      filetype: z.string(),
    })
    .array(),
});

const MessageUpdateSchema = z.object({
  message: z.string(defaultError("Pesan tidak boleh kosong!")).min(1).optional(),
  files: z
    .object(
      {
        filename: z.string(),
        content: z.string(),
      },
      defaultError("Format lampiran tidak valid!"),
    )
    .array()
    .optional(),
});

const MessageCreationSchema = z.object({
  message: z.string(defaultError("Pesan tidak boleh kosong!")),
  files: z
    .object(
      {
        filename: z.string(),
        content: z.string(),
      },
      defaultError("Format lampiran tidak valid!"),
    )
    .array()
    .optional(),
});

const ChatroomParamsSchema = z.object({
  chatroom_id: zodStringReadableAsNumber("Nomor ruang chat tidak valid!"),
});

const ChatroomMembersParamSchema = z.object({
  chatroom_id: zodStringReadableAsNumber("Nomor ruang chat tidak valid!"),
  user_id: zodStringReadableAsNumber("Nomor pengguna tidak valid!"),
});

const ChatroomResponseSchema = z.object({
  project_id: z.number().nullable(),
  chatroom_id: z.number(),
  chatroom_name: z.string(),
  chatroom_created_at: z.date(),
  chatroom_users: z
    .object({
      user_id: z.number(),
    })
    .array(),
});

export class ChatController extends Controller {
  private socket_server: ServerType;
  private chat_service: ChatService;

  constructor(express_server: Express, socket_server: Server, chat_service: ChatService) {
    super(express_server);
    this.socket_server = socket_server;
    this.chat_service = chat_service;
  }

  init() {
    return {
      ChatroomsGet: this.ChatroomsGet,
      ChatroomsPost: this.ChatroomsPost,
      ChatroomsDetailGet: this.ChatroomsDetailGet,
      ChatroomsDetailPut: this.ChatroomsDetailPut,
      ChatroomsDetailDelete: this.ChatroomsDetailDelete,
      ChatroomsDetailMessagesPost: this.ChatroomsDetailMessagesPost,
      ChatroomsDetailMessagesPut: this.ChatroomsDetailMessagesPut,
      ChatroomsDetailMessagesGet: this.ChatroomsDetailMessagesGet,
      FileDetailGet: this.FileDetailGet,
      ChatroomsDetailUsersDetailPut: this.ChatroomsDetailUsersDetailPut,
      ChatroomsDetailUsersDetailDelete: this.ChatroomsDetailUsersDetailDelete,
    };
  }

  private async broadcastEvent<ev extends EventNames<ServerToClientEvents>>(
    user_ids: number[],
    event: ev,
    ...args: EventParams<ServerToClientEvents, ev>
  ) {
    const socks = await this.socket_server.fetchSockets();

    const filtered = socks.filter(
      (x) => x.data.userId != undefined && user_ids.includes(x.data.userId),
    );
    filtered.forEach((x) => x.emit(event, ...args));
  }

  ChatroomsPost = new Route({
    method: "post",
    path: "/api/chatrooms",
    priors: [validateLogged],
    schema: {
      ReqBody: z.object({
        chatroom_name: z.string(defaultError("Nama ruang chat tidak valid!")).min(1),
        project_id: z.number(defaultError("Nomor proyek tidak valid!")).optional(),
        user_ids: z.number(defaultError("Nomor pengguna tidak valid!")).array().optional(),
      }),
      ResBody: ChatroomResponseSchema,
    },
    handler: async (req, res) => {
      const { chatroom_name, project_id, user_ids } = req.body;
      const sender_id = Number(req.session.user_id);

      const chatroom_id = await this.chat_service.addChatroom(
        {
          chatroom_name,
          project_id,
          user_ids,
        },
        sender_id,
      );

      if (!chatroom_id) {
        throw new Error("Chatroom gagal untuk dibuat!");
      }

      const members = await this.chat_service.getAllowedListeners(chatroom_id);
      await this.broadcastEvent(members, "roomUpdate");

      const chatroom_data = await this.chat_service.getChatroomByID(chatroom_id);
      if (!chatroom_data) {
        throw new Error("Chatroom gagal untuk dibuat!");
      }

      res.status(201).json(chatroom_data);
    },
  });

  ChatroomsGet = new Route({
    method: "get",
    path: "/api/chatrooms",
    priors: [validateLogged],
    schema: {
      ReqQuery: z.object({
        project_id: zodStringReadableAsNumber("Nomor proyek tidak valid!").optional(),
        user_id: zodStringReadableAsNumber("Nomor pengguna tidak valid!").optional(),
        keyword: z.string(defaultError("Nama ruang chat tidak valid!")).min(1).optional(),
      }),
      ResBody: ChatroomResponseSchema.array(),
    },
    handler: async (req, res) => {
      const { user_id: user_id_raw, project_id: project_id_raw, keyword } = req.query;
      const user_id = user_id_raw !== undefined ? Number(user_id_raw) : undefined;
      const project_id = project_id_raw !== undefined ? Number(project_id_raw) : undefined;

      const result = await this.chat_service.getChatrooms({
        user_id,
        project_id,
        keyword,
      });
      res.status(200).json(result);
    },
  });

  ChatroomsDetailGet = new Route({
    method: "get",
    path: "/api/chatrooms/:chatroom_id",
    priors: [validateLogged],
    schema: {
      Params: ChatroomParamsSchema,
      ResBody: ChatroomResponseSchema,
    },
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
  });

  ChatroomsDetailUsersDetailPut = new Route({
    method: "put",
    path: "/api/chatrooms/:chatroom_id/users/:user_id",
    priors: [validateLogged],
    schema: {
      Params: ChatroomMembersParamSchema,
      ResBody: z.object({
        role: z.literal("Member"),
      }),
      ReqBody: z.object({
        role: z.literal("Member"),
      }),
    },
    handler: async (req, res) => {
      const { chatroom_id: chatroom_id_raw, user_id: user_id_raw } = req.params;
      const user_id = Number(user_id_raw);
      const chatroom_id = Number(chatroom_id_raw);
      const sender_id = req.session.user_id!;

      const old_members = await this.chat_service.getAllowedListeners(chatroom_id);
      await this.chat_service.addChatroomMember(chatroom_id, user_id, sender_id);
      const new_members = await this.chat_service.getAllowedListeners(chatroom_id);

      const users_to_notify = [...old_members, ...new_members];

      await this.broadcastEvent(users_to_notify, "roomUpdate");

      res.status(200).json({
        role: "Member",
      });
    },
  });

  ChatroomsDetailUsersDetailDelete = new Route({
    method: "delete",
    path: "/api/chatrooms/:chatroom_id/users/:user_id",
    priors: [validateLogged],
    schema: {
      Params: ChatroomMembersParamSchema,
      ResBody: z.object({
        msg: z.string(),
      }),
    },
    handler: async (req, res) => {
      const { chatroom_id: chatroom_id_raw, user_id: user_id_raw } = req.params;
      const user_id = Number(user_id_raw);
      const chatroom_id = Number(chatroom_id_raw);
      const sender_id = req.session.user_id!;

      const old_members = await this.chat_service.getAllowedListeners(chatroom_id);
      await this.chat_service.deleteChatroomMember(chatroom_id, user_id, sender_id);
      const new_members = await this.chat_service.getAllowedListeners(chatroom_id);

      const users_to_notify = [...old_members, ...new_members];

      await this.broadcastEvent(users_to_notify, "roomUpdate");

      res.status(200).json({
        msg: "User removed!",
      });
    },
  });

  ChatroomsDetailPut = new Route({
    method: "put",
    path: "/api/chatrooms/:chatroom_id",
    priors: [validateLogged],
    schema: {
      Params: ChatroomParamsSchema,
      ReqBody: z.object({
        name: z.string(defaultError("Nama ruang chat tidak valid!")).min(1).optional(),
      }),
      ResBody: ChatroomResponseSchema,
    },
    handler: async (req, res) => {
      const { name } = req.body;
      const { chatroom_id: chatroom_id_str } = req.params;
      const chatroom_id = Number(chatroom_id_str);
      const sender_id = req.session.user_id!;

      const old_members = await this.chat_service.getAllowedListeners(chatroom_id);
      await this.chat_service.updateChatroom(chatroom_id, { name }, sender_id);
      const new_members = await this.chat_service.getAllowedListeners(chatroom_id);

      const users_to_notify = [...old_members, ...new_members];

      await this.broadcastEvent(users_to_notify, "roomUpdate");

      const result = await this.chat_service.getChatroomByID(chatroom_id);

      res.status(200).json(result);
    },
  });
  ChatroomsDetailDelete = new Route({
    method: "delete",
    path: "/api/chatrooms/:chatroom_id",
    priors: [validateLogged],
    schema: {
      Params: ChatroomParamsSchema,
      ResBody: z.object({
        msg: z.string(),
      }),
    },
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
  });
  ChatroomsDetailMessagesPost = new Route({
    method: "post",
    path: "/api/chatrooms/:chatroom_id/messages",
    priors: [validateLogged],
    schema: {
      Params: ChatroomParamsSchema,
      ReqBody: MessageCreationSchema,
      ResBody: MessageResponseSchema,
    },
    handler: async (req, res) => {
      const { chatroom_id: chatroom_id_str } = req.params;
      const { message, files } = req.body;
      const chatroom_id = Number(chatroom_id_str);
      const user_id = req.session.user_id!;

      if (message.length === 0 && (files == undefined || files.length === 0)) {
        throw new ClientError("Pesan tidak boleh kosong!");
      }

      const id = await this.chat_service.sendMessage(chatroom_id, {
        sender_id: user_id,
        files,
        message,
      });

      if (!id) {
        throw new Error("Pesan tidak terkirim!");
      }

      const ret = await this.chat_service.getMessage(id.id);

      if (!ret) {
        throw new Error("Pesan tidak terkirim!");
      }

      const members = await this.chat_service.getAllowedListeners(chatroom_id);
      await this.broadcastEvent(members, "msg", chatroom_id, ret);

      res.status(201).json(ret);
    },
  });
  ChatroomsDetailMessagesPut = new Route({
    method: "put",
    path: "/api/chatrooms/:chatroom_id/messages/:message_id",
    priors: [validateLogged],
    schema: {
      Params: z.object({
        chatroom_id: zodStringReadableAsNumber("Nomor ruang chat tidak valid!"),
        message_id: zodStringReadableAsNumber("Nomor pesan tidak valid!"),
      }),
      ResBody: MessageResponseSchema,
      ReqBody: MessageUpdateSchema,
    },
    handler: async (req, res) => {
      const { chatroom_id: chatroom_id_str, message_id: message_id_str } = req.params;
      const { files, message } = req.body;
      const chatroom_id = Number(chatroom_id_str);
      const message_id = Number(message_id_str);
      const user_id = req.session.user_id!;

      await this.chat_service.updateMessage(message_id, { files, message }, user_id);

      const ret = await this.chat_service.getMessage(message_id);

      if (!ret) {
        throw new NotFoundError("Gagal menemukan pesan tersebut!");
      }

      const members = await this.chat_service.getAllowedListeners(chatroom_id);
      await this.broadcastEvent(members, "msgUpd", chatroom_id, ret);

      res.status(200).json(ret);
    },
  });
  ChatroomsDetailMessagesGet = new Route({
    method: "get",
    path: "/api/chatrooms/:chatroom_id/messages",
    priors: [validateLogged],
    schema: {
      Params: z.object({
        chatroom_id: zodStringReadableAsNumber("Nomor ruang chat tidak valid!"),
      }),
      ReqQuery: z.object({
        limit: zodStringReadableAsNumber("Limit tidak valid!").optional(),
        before_message_id: zodStringReadableAsNumber("Angka pesan tidak valid!").optional(),
      }),
      ResBody: MessageResponseSchema.array(),
    },
    handler: async (req, res) => {
      const { chatroom_id: chatroom_id_str } = req.params;
      const chatroom_id = Number(chatroom_id_str);

      const { limit: limit_raw, before_message_id: before_message_id_raw } = req.query;
      const limit = limit_raw != undefined ? Number(limit_raw) : undefined;
      const before_message_id =
        before_message_id_raw != undefined ? Number(before_message_id_raw) : undefined;

      const user_id = req.session.user_id!;

      const val = await this.chat_service.isAllowed(chatroom_id, user_id);
      if (!val) {
        throw new AuthError("Anda tidak memiliki akses untuk membaca chat ini!");
      }

      const result = await this.chat_service.getMessages({ chatroom_id, limit, before_message_id });

      res.status(200).json(result);
    },
  });
  FileDetailGet = new Route({
    method: "get",
    path: "/api/files/:file_id",
    priors: [validateLogged],
    schema: {
      ResBody: z.undefined(),
      Params: z.object({
        file_id: zodStringReadableAsNumber("Nomor file invalid!"),
      }),
    },
    handler: async (req, res) => {
      const { file_id: file_id_raw } = req.params;

      const sender_id = Number(req.session.user_id);
      const file_id = Number(file_id_raw);

      const file = await this.chat_service.getFile(file_id, sender_id);
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename=${file.filename}`);
      res.end(file.content);
    },
  });
}
