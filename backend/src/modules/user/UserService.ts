import { hashSync } from "bcryptjs";
import { ClientError } from "../../helpers/error.js";
import { UserRepository } from "./UserRepository.js";

export class UserService {
  private user_repo: UserRepository;
  constructor(user_repo: UserRepository) {
    this.user_repo = user_repo;
  }

  getUserByID(id: number) {
    return this.user_repo.findUserByID(id);
  }

  async addUser(user_name: string, user_password: string) {
    const similar_name = await this.user_repo.findUserByName(user_name);
    if (similar_name) {
      throw new ClientError("Sudah ada user dengan nama yang sama!");
    }

    const hashed_password = hashSync(user_password, 10);
    return await this.user_repo.addUser(user_name, hashed_password);
  }

  async getUsers() {
    return this.user_repo.getUsers();
  }
}
