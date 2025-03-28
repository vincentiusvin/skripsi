import { AuthError, ClientError, NotFoundError } from "../../helpers/error.js";
import { Transactable, TransactionManager } from "../../helpers/transaction/transaction.js";
import { FriendService, friendServiceFactory } from "../friend/FriendService.js";
import {
  NotificationService,
  envNotificationServiceFactory,
} from "../notification/NotificationService.js";
import { PreferenceService, preferenceServiceFactory } from "../preferences/PreferenceService.js";
import { ProjectService, projectServiceFactory } from "../project/ProjectService.js";
import { UserService, envUserServiceFactory } from "../user/UserService.js";
import { ChatRepository } from "./ChatroomRepository.js";

export function chatServiceFactory(transaction_manager: TransactionManager) {
  const db = transaction_manager.getDB();
  const chat_repo = new ChatRepository(db);
  const user_service = envUserServiceFactory(transaction_manager);
  const preference_service = preferenceServiceFactory(transaction_manager);
  const notification_service = envNotificationServiceFactory(transaction_manager);
  const project_service = projectServiceFactory(transaction_manager);
  const friend_service = friendServiceFactory(transaction_manager);
  const chat_service = new ChatService(
    chat_repo,
    project_service,
    user_service,
    notification_service,
    preference_service,
    friend_service,
    transaction_manager,
  );
  return chat_service;
}

// Kalau chatroomnya berkaitan dengan projek, validasi pakai daftar member projek.
// Kalau chatroomnya bukan, validasi pakai daftar member chatroom
export class ChatService implements Transactable<ChatService> {
  private repo: ChatRepository;
  private project_service: ProjectService;
  private user_service: UserService;
  private notification_service: NotificationService;
  private preference_service: PreferenceService;
  private friend_service: FriendService;
  private transaction_manager: TransactionManager;

  factory = chatServiceFactory;

  constructor(
    repo: ChatRepository,
    project_service: ProjectService,
    user_service: UserService,
    notification_service: NotificationService,
    preference_service: PreferenceService,
    friend_service: FriendService,
    transaction_manager: TransactionManager,
  ) {
    this.repo = repo;
    this.project_service = project_service;
    this.user_service = user_service;
    this.notification_service = notification_service;
    this.preference_service = preference_service;
    this.friend_service = friend_service;
    this.transaction_manager = transaction_manager;
  }

  async getChatrooms(opts: { user_id?: number; project_id?: number; keyword?: string }) {
    return await this.repo.getChatrooms(opts);
  }

  private async getMembers(chatroom_id: number) {
    return await this.transaction_manager.transaction(this as ChatService, async (serv) => {
      const chatroom = await serv.repo.getChatroomByID(chatroom_id);
      if (!chatroom) {
        throw new NotFoundError("Chatroom gagal ditemukan!");
      }
      if (chatroom.project_id != null) {
        const project = await serv.project_service.getProjectByID(chatroom.project_id);
        if (!project) {
          throw new Error("Chatroom tidak memiliki proyek!");
        }
        return project.project_members.map((x) => x.user_id);
      } else {
        return chatroom.chatroom_users.map((x) => x.user_id);
      }
    });
  }

  async getAllowedListeners(chatroom_id: number) {
    return await this.transaction_manager.transaction(this as ChatService, async (serv) => {
      const members = await serv.getMembers(chatroom_id);
      const admins = await serv.user_service.getUsers({ is_admin: true });
      return [...members, ...admins.map((x) => x.user_id)];
    });
  }

  async isAllowed(chatroom_id: number, user_id: number) {
    const members = await this.getMembers(chatroom_id);
    const is_member = members.some((member_id) => member_id === user_id);
    if (is_member) {
      return true;
    }
    const is_admin = await this.user_service.isAdminUser(user_id);
    return is_admin;
  }

  async getMessages(opts: { chatroom_id: number; limit?: number; before_message_id?: number }) {
    return await this.repo.getMessages(opts);
  }

  private async sendMessageNotification(message_id: number) {
    const msg = await this.getMessage(message_id);
    if (!msg) {
      throw new Error("Pesan tidak ditemukan!");
    }
    const chatroom = await this.getChatroomByID(msg?.chatroom_id);
    if (!chatroom) {
      throw new Error("Pesan tidak ditemukan!");
    }

    const chatroom_users = await this.getMembers(chatroom.chatroom_id);

    await Promise.all(
      chatroom_users.map((user_id) =>
        this.notification_service.addNotification({
          title: `Pesan masuk di "${chatroom.chatroom_name}"`,
          description: `${msg.message}`,
          type: chatroom.project_id != null ? "Diskusi Proyek" : "Diskusi Pribadi",
          type_id: chatroom.chatroom_id,
          user_id: user_id,
        }),
      ),
    );
  }

  async sendMessage(
    chatroom_id: number,
    data: {
      sender_id: number;
      message: string;
      files?: {
        filename: string;
        content: string;
      }[];
    },
  ) {
    return await this.transaction_manager.transaction(this as ChatService, async (serv) => {
      const { sender_id } = data;
      const val = await serv.isAllowed(chatroom_id, sender_id);
      if (!val) {
        throw new AuthError("Anda tidak memiliki akses untuk mengirim ke chat ini!");
      }

      const res = await serv.repo.addMessage(chatroom_id, data);
      await serv.sendMessageNotification(res.id);
      return res;
    });
  }

  async updateMessage(
    message_id: number,
    data: {
      message?: string;
      files?: {
        filename: string;
        content: string;
      }[];
    },
    sender_id: number,
  ) {
    return await this.transaction_manager.transaction(this as ChatService, async (serv) => {
      const old_message = await serv.getMessage(message_id);
      if (!old_message) {
        throw new NotFoundError("Pesan tidak ditemukan!");
      }

      if (old_message.user_id !== sender_id) {
        throw new AuthError("Anda tidak memiliki akses untuk mengubah pesan ini!");
      }

      return await serv.repo.updateMessage(message_id, {
        ...data,
        is_edited: true,
      });
    });
  }

  async getMessage(message_id: number) {
    return await this.repo.getMessage(message_id);
  }

  async getChatroomByID(chatroom_id: number) {
    return await this.repo.getChatroomByID(chatroom_id);
  }

  async getFile(file_id: number, sender_id: number) {
    return await this.transaction_manager.transaction(this as ChatService, async (serv) => {
      const chatroom_id = await serv.repo.findChatroomByFileID(file_id);
      if (chatroom_id == undefined) {
        throw new NotFoundError("File gagal ditemukan!");
      }

      const allowed = await serv.isAllowed(chatroom_id.id, sender_id);
      if (!allowed) {
        throw new AuthError("Anda tidak memiliki akses untuk membaca file ini!");
      }

      const file = await serv.repo.getFile(file_id);
      if (!file) {
        throw new NotFoundError("File gagal ditemukan!");
      }
      return file;
    });
  }

  async deleteChatroom(chatroom_id: number, sender_id: number) {
    return await this.transaction_manager.transaction(this as ChatService, async (serv) => {
      const val = await serv.isAllowed(chatroom_id, sender_id);
      if (!val) {
        throw new AuthError("Anda tidak memiliki akses untuk menghapus chat ini!");
      }
      await serv.repo.deleteChatroom(chatroom_id);
    });
  }

  async updateChatroom(chatroom_id: number, opts: { name?: string }, sender_id: number) {
    return await this.transaction_manager.transaction(this as ChatService, async (serv) => {
      const val = await serv.isAllowed(chatroom_id, sender_id);
      if (!val) {
        throw new AuthError("Anda tidak memiliki akses untuk mengubah chat ini!");
      }

      const chatroom = await serv.getChatroomByID(chatroom_id);
      if (chatroom == undefined) {
        throw new NotFoundError("Gagal menemukan ruangan tersebut!");
      }

      await serv.repo.updateChatroom(chatroom_id, opts);
    });
  }

  async addChatroomMember(chatroom_id: number, user_id: number, sender_id: number) {
    await this.transaction_manager.transaction(this as ChatService, async (serv) => {
      const room = await serv.getChatroomByID(chatroom_id);
      if (room == undefined) {
        throw new NotFoundError("Gagal menemukan ruangan tersebut!");
      }

      const val = await serv.isAllowed(chatroom_id, sender_id);
      if (!val) {
        throw new AuthError("Anda tidak memiliki akses untuk mengubah chat ini!");
      }

      if (room.project_id) {
        throw new ClientError(
          "Anda tidak dapat mengkonfigurasi anggota untuk ruang diskusi proyek!",
        );
      }
      const members = await serv.repo.getMembers(chatroom_id);
      if (members.includes(user_id)) {
        throw new ClientError("Pengguna ini sudah menjadi anggota ruangan!");
      }
      await this.validateChatroomMember(user_id, sender_id);
      await serv.repo.addChatroomMember(chatroom_id, user_id);
    });
  }

  async deleteChatroomMember(chatroom_id: number, user_id: number, sender_id: number) {
    await this.transaction_manager.transaction(this as ChatService, async (serv) => {
      const room = await serv.getChatroomByID(chatroom_id);
      if (room == undefined) {
        throw new NotFoundError("Gagal menemukan ruangan tersebut!");
      }

      const val = await serv.isAllowed(chatroom_id, sender_id);
      if (!val) {
        throw new AuthError("Anda tidak memiliki akses untuk mengubah chat ini!");
      }

      if (room.project_id) {
        throw new ClientError(
          "Anda tidak dapat mengkonfigurasi anggota untuk ruang diskusi proyek!",
        );
      }
      const members = await serv.repo.getMembers(chatroom_id);
      if (!members.includes(user_id)) {
        throw new ClientError("Pengguna ini belum menjadi anggota ruangan!");
      }

      await serv.repo.deleteChatroomMember(chatroom_id, user_id);
    });
  }

  async addChatroom(
    opts: { project_id?: number; user_ids?: number[]; chatroom_name: string },
    sender_id: number,
  ) {
    const { project_id, user_ids, chatroom_name } = opts;
    return await this.transaction_manager.transaction(this as ChatService, async (serv) => {
      if (project_id != undefined && user_ids != undefined) {
        throw new ClientError(
          "Anda tidak dapat mengkonfigurasi anggota untuk ruang diskusi proyek!",
        );
      }

      if (project_id !== undefined) {
        const member_role = await serv.project_service.getMemberRole(project_id, sender_id);
        if (member_role !== "Admin" && member_role !== "Dev") {
          throw new AuthError("Anda tidak memiliki akses untuk mengubah proyek ini!");
        }
        return await serv.repo.addChatroom({ project_id, chatroom_name });
      }

      if (user_ids !== undefined) {
        for (const user_id of user_ids) {
          await this.validateChatroomMember(user_id, sender_id);
        }
        return await serv.repo.addChatroom({ chatroom_name, user_ids });
      }
    });
  }

  private async validateChatroomMember(user_id: number, sender_id: number) {
    const our_data = await this.user_service.getUserDetail(sender_id);
    if (our_data?.user_is_admin) {
      return;
    }

    const user_data = await this.user_service.getUserDetail(user_id);
    if (user_data == undefined) {
      throw new Error("Gagal menemukan pengguna tersebut!");
    }

    const pref = await this.preference_service.getUserPreference(user_id);
    if (pref.friend_invite === "on") {
      return;
    }

    const friend_status = await this.friend_service.getFriendStatus(sender_id, user_id);
    if (friend_status !== "Accepted") {
      throw new ClientError(
        `Pengguna "${user_data.user_name}" tidak menerima pesan dari orang asing!`,
      );
    }
  }
}
