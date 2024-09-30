import { AuthError, NotFoundError } from "../../helpers/error.js";
import { ProjectService } from "../project/ProjectService.js";
import { ChatRepository } from "./ChatroomRepository.js";

// Kalau chatroomnya berkaitan dengan projek, validasi pakai daftar member projek.
// Kalau chatroomnya bukan, validasi pakai daftar member chatroom
export class ChatService {
  repo: ChatRepository;
  project_service: ProjectService;
  constructor(repo: ChatRepository, project_service: ProjectService) {
    this.repo = repo;
    this.project_service = project_service;
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

  async isAllowed(chatroom_id: number, user_id: number) {
    const members = await this.getMembers(chatroom_id);
    return members.some((member_id) => member_id === user_id);
  }

  async getMessages(chatroom_id: number) {
    return await this.repo.getMessages(chatroom_id);
  }

  async sendMessage(chatroom_id: number, sender_id: number, message: string) {
    const val = await this.isAllowed(chatroom_id, sender_id);
    if (!val) {
      throw new AuthError("Anda tidak memiliki akses untuk mengirim ke chat ini!");
    }

    return await this.repo.addMessage(chatroom_id, sender_id, message);
  }

  async updateMessage(
    message_id: number,
    obj: { chatroom_id?: number; sender_id?: number; message?: string },
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
      ...obj,
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
    const val = await this.isAllowed(chatroom_id, sender_id);
    if (!val) {
      throw new AuthError("Anda tidak memiliki akses untuk mengirim ke chat ini!");
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
