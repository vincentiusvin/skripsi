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
  async getUserAccountDetail(id: number) {
    return await this.user_repo.getAccountDetails(id);
  }

  async getUserAccountByEmail(email: string) {
    return await this.user_repo.getUserAccountByEmail(email);
  }

  async updateAccountDetail(
    id: number,
    obj: {
      user_name?: string;
      user_email?: string;
      user_education_level?: string;
      user_school?: string;
      user_about_me?: string;
      user_image?: string;
      user_password?: string;
    },
  ) {
    const { user_password, user_email } = obj;
    let hashed_password: string | undefined = undefined;
    if (user_password) {
      hashed_password = hashSync(user_password, 10);
    }
    if (user_email) {
      const same_email = await this.getUserAccountByEmail(user_email);
      if (same_email != undefined) {
        throw new ClientError("Sudah ada user dengan email yang sama !");
      }
    }
    return await this.user_repo.updateAccountDetails(id, {
      ...obj,
      user_password: hashed_password,
    });
  }
}
