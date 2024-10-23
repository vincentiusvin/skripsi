import { Kysely } from "kysely";
import { DB } from "../../db/db_types.js";
import { AuthError, ClientError } from "../../helpers/error.js";
import {
  NotificationService,
  notificationServiceFactory,
} from "../notification/NotificationService.js";
import { UserService, userServiceFactory } from "../user/UserService.js";
import { FriendStatus } from "./FriendMisc.js";
import { FriendRepository } from "./FriendRepository.js";

export function friendServiceFactory(db: Kysely<DB>) {
  const friend_repo = new FriendRepository(db);
  const user_service = userServiceFactory(db);
  const notification_service = notificationServiceFactory(db);

  const friend_service = new FriendService(friend_repo, user_service, notification_service);
  return friend_service;
}

export class FriendService {
  private repo: FriendRepository;
  private user_service: UserService;
  private notification_service: NotificationService;
  constructor(
    repo: FriendRepository,
    user_service: UserService,
    notification_service: NotificationService,
  ) {
    this.repo = repo;
    this.user_service = user_service;
    this.notification_service = notification_service;
  }

  getFriends(user_id: number) {
    return this.repo.getFriends(user_id);
  }

  async getFriendStatus(from_user_id: number, to_user_id: number): Promise<FriendStatus> {
    const result = await this.repo.getFriendData(from_user_id, to_user_id);
    if (result == undefined) {
      return "None";
    } else {
      return result.status;
    }
  }

  async updateFriend(
    from_user_id: number,
    to_user_id: number,
    status: "Accepted" | "Sent" | "Pending",
    sender_id: number,
  ) {
    if (from_user_id != sender_id) {
      throw new AuthError("Anda tidak memiliki akses untuk mengubah koneksi orang lain!");
    }

    if (status === "Accepted") {
      await this.acceptFriend(from_user_id, to_user_id);
    } else if (status === "Sent") {
      await this.addFriend(from_user_id, to_user_id);
    }
  }

  private async sendFriendInviteNotification(recv_user_id: number, sender_user_id: number) {
    const sender = await this.user_service.getUserDetail(sender_user_id);
    if (!sender) {
      throw new Error(`Gagal menemukan pengguna ${sender_user_id}`);
    }

    return this.notification_service.addNotification({
      title: `Undangan teman dari "${sender.user_name}"`,
      user_id: recv_user_id,
      description: `Anda diundang untuk berteman oleh ${sender.user_name}. Anda dapat menerima atau mengabaikan permintaan ini.`,
      type: "Friend",
      type_id: sender_user_id,
    });
  }

  private async sendFriendAcceptNotification(recv_user_id: number, sender_user_id: number) {
    const accepter = await this.user_service.getUserDetail(recv_user_id);
    if (!accepter) {
      throw new Error(`Gagal menemukan pengguna ${recv_user_id}`);
    }

    return this.notification_service.addNotification({
      title: `Undangan teman diterima oleh "${accepter.user_name}"`,
      user_id: sender_user_id,
      description: `Undangan pertemanan anda diterima oleh ${accepter.user_name}!.`,
      type: "Friend",
      type_id: sender_user_id,
    });
  }

  private async addFriend(from_user_id: number, to_user_id: number) {
    const current_status = await this.getFriendStatus(from_user_id, to_user_id);
    if (current_status === "None") {
      await this.repo.addFriend(from_user_id, to_user_id, "Pending");
      await this.sendFriendInviteNotification(to_user_id, from_user_id);
    } else if (current_status === "Accepted") {
      throw new ClientError("Anda sudah berteman dengan orang ini!");
    } else if (current_status === "Sent" || current_status === "Pending") {
      throw new ClientError("Anda memiliki permintaan pertemanan dengan orang ini!");
    }
  }

  private async acceptFriend(from_user_id: number, to_user_id: number) {
    const current_status = await this.getFriendStatus(from_user_id, to_user_id);
    if (current_status === "Pending") {
      await this.sendFriendAcceptNotification(from_user_id, to_user_id);
      await this.repo.updateFriend(to_user_id, from_user_id, "Accepted"); // memang harus dibalik
    } else {
      throw new ClientError("Anda tidak memiliki permintaan teman dari orang ini!");
    }
  }

  async deleteFriend(user1: number, user2: number) {
    const current_status = await this.getFriendStatus(user1, user2);
    if (current_status === "None") {
      throw new ClientError("Anda tidak memiliki relasi dengan orang ini!");
    }
    return this.repo.deleteFriend(user1, user2);
  }
}
