import { AuthError, ClientError, NotFoundError } from "../../helpers/error.js";
import { NotificationService } from "../notification/NotificationService.js";
import { PreferenceService } from "../preferences/PreferenceService.js";
import { ProjectService } from "../project/ProjectService.js";
import { UserService } from "../user/UserService.js";
import { ChatRepository } from "./ChatroomRepository.js";

// Kalau chatroomnya berkaitan dengan projek, validasi pakai daftar member projek.
// Kalau chatroomnya bukan, validasi pakai daftar member chatroom
export class ChatService {
  private repo: ChatRepository;
  private project_service: ProjectService;
  private user_service: UserService;
  private notification_service: NotificationService;
  private preference_service: PreferenceService;

  constructor(
    repo: ChatRepository,
    project_service: ProjectService,
    user_service: UserService,
    notification_service: NotificationService,
    preference_service: PreferenceService,
  ) {
    this.repo = repo;
    this.project_service = project_service;
    this.user_service = user_service;
    this.notification_service = notification_service;
    this.preference_service = preference_service;
  }

  async getMembers(chatroom_id: number) {
    const chatroom = await this.repo.getChatroomByID(chatroom_id);
    if (!chatroom) {
      throw new NotFoundError("Chatroom gagal ditemukan!");
    }
    if (chatroom.project_id != null) {
      const project = await this.project_service.getProjectByID(chatroom.project_id);
      if (!project) {
        throw new Error("Chatroom tidak memiliki proyek!");
      }
      return project.project_members.map((x) => x.user_id);
    } else {
      return chatroom.chatroom_users.map((x) => x.user_id);
    }
  }

  async getAllowedListeners(chatroom_id: number) {
    const members = await this.getMembers(chatroom_id);
    const admins = await this.user_service.getUsers({ is_admin: true });
    return [...members, ...admins.map((x) => x.user_id)];
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

  async getMessages(chatroom_id: number) {
    return await this.repo.getMessages(chatroom_id);
  }

  async sendMessageNotification(message_id: number) {
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
          type: chatroom.project_id != null ? "ProjectChat" : "GeneralChat",
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
    const { sender_id } = data;
    const val = await this.isAllowed(chatroom_id, sender_id);
    if (!val) {
      throw new AuthError("Anda tidak memiliki akses untuk mengirim ke chat ini!");
    }

    const res = await this.repo.addMessage(chatroom_id, data);
    await this.sendMessageNotification(res.id);
    return res;
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
    const old_message = await this.getMessage(message_id);
    if (!old_message) {
      throw new NotFoundError("Pesan tidak ditemukan!");
    }

    if (old_message.user_id !== sender_id) {
      throw new AuthError("Anda tidak memiliki akses untuk mengubah pesan ini!");
    }

    return await this.repo.updateMessage(message_id, {
      ...data,
      is_edited: true,
    });
  }

  async getMessage(message_id: number) {
    return await this.repo.getMessage(message_id);
  }

  async getChatroomByID(chatroom_id: number) {
    return await this.repo.getChatroomByID(chatroom_id);
  }

  async getProjectChatrooms(project_id: number) {
    return await this.repo.getProjectChatrooms(project_id);
  }

  async addProjectChatroom(project_id: number, chatroom_name: string, sender_id: number) {
    const member_role = await this.project_service.getMemberRole(project_id, sender_id);
    if (member_role !== "Admin" && member_role !== "Dev") {
      throw new AuthError("Anda tidak memiliki akses untuk melakukan hal ini!");
    }

    return await this.repo.addProjectChatroom(project_id, chatroom_name);
  }

  async getUserChatrooms(user_id: number) {
    return await this.repo.getUserChatrooms(user_id);
  }

  async getFile(file_id: number, sender_id: number) {
    const chatroom_id = await this.repo.findChatroomByFileID(file_id);
    if (chatroom_id == undefined) {
      throw new NotFoundError("File gagal ditemukan!");
    }

    const allowed = await this.isAllowed(chatroom_id.id, sender_id);
    if (!allowed) {
      throw new AuthError("Anda tidak memiliki akses untuk membaca file ini!");
    }

    const file = await this.repo.getFile(file_id);
    if (!file) {
      throw new NotFoundError("File gagal ditemukan!");
    }
    return file;
  }

  async addUserChatroom(user_id: number, chatroom_name: string, sender_id: number) {
    if (sender_id != user_id) {
      throw new AuthError("Anda tidak memiliki akses untuk menambahkan chatroom orang lain!");
    }

    return await this.repo.addUserChatroom(user_id, chatroom_name);
  }

  async updateChatroom(
    chatroom_id: number,
    opts: { name?: string; user_ids?: number[] },
    sender_id: number,
  ) {
    const { user_ids } = opts;
    const val = await this.isAllowed(chatroom_id, sender_id);
    if (!val) {
      throw new AuthError("Anda tidak memiliki akses untuk mengirim ke chat ini!");
    }

    const chatroom = await this.getChatroomByID(chatroom_id);
    if (chatroom == undefined) {
      throw new NotFoundError("Gagal menemukan ruangan tersebut!");
    }

    if (user_ids != undefined) {
      if (chatroom.project_id != undefined) {
        throw new ClientError(
          "Anda tidak dapat mengkonfigurasi anggota untuk ruang diskusi proyek!",
        );
      }

      const old_members = chatroom.chatroom_users.map((x) => x.user_id);
      for (const user_id of user_ids) {
        if (old_members.includes(user_id)) {
          continue;
        }
        const pref = await this.preference_service.getUserPreference(user_id);
        if (pref.friend_invite === "off") {
          const user_data = await this.user_service.getUserDetail(user_id);
          if (user_data == undefined) {
            throw new Error("Gagal menemukan pengguna tersebut!");
          }
          throw new ClientError(
            `Pengguna "${user_data.user_name}" tidak menerima pesan dari orang asing!`,
          );
        }
      }
    }

    await this.repo.updateChatroom(chatroom_id, opts);
  }

  async deleteChatroom(chatroom_id: number, sender_id: number) {
    const val = await this.isAllowed(chatroom_id, sender_id);
    if (!val) {
      throw new AuthError("Anda tidak memiliki akses untuk mengirim ke chat ini!");
    }
    await this.repo.deleteChatroom(chatroom_id);
  }
}
