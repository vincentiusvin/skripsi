import { ClientError } from "../../helpers/error.js";
import { FriendStatus } from "./FriendMisc.js";
import { FriendRepository } from "./FriendRepository.js";

export class FriendService {
  private repo: FriendRepository;
  constructor(repo: FriendRepository) {
    this.repo = repo;
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

  addFriend(from_user_id: number, to_user_id: number) {
    return this.repo.addFriend(from_user_id, to_user_id, "Pending");
  }

  async acceptFriend(from_user_id: number, to_user_id: number) {
    const current_status = await this.getFriendStatus(from_user_id, to_user_id);
    if (current_status === "Pending") {
      return this.repo.updateFriend(from_user_id, to_user_id, "Accepted");
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
