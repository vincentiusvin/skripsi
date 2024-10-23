import { compareSync, hashSync } from "bcryptjs";
import { Kysely } from "kysely";
import { DB } from "../../db/db_types.js";
import { AuthError, ClientError, NotFoundError } from "../../helpers/error.js";
import { UserRepository } from "./UserRepository.js";

export function userServiceFactory(db: Kysely<DB>) {
  const user_repo = new UserRepository(db);

  const user_service = new UserService(user_repo);
  return user_service;
}

export class UserService {
  private user_repo: UserRepository;
  constructor(user_repo: UserRepository) {
    this.user_repo = user_repo;
  }

  async isAdminUser(user_id: number): Promise<boolean> {
    const user = await this.user_repo.getUserDetail(user_id);
    if (!user) {
      throw new NotFoundError("Pengguna tidak ditemukan!");
    }
    return user.user_is_admin;
  }

  async getAdminUser(user_id: number): Promise<boolean> {
    const user = await this.user_repo.getUserDetail(user_id);
    if (!user) {
      throw new NotFoundError("Pengguna tidak ditemukan!");
    }
    return user.user_is_admin;
  }

  async findUserByEmail(email: string) {
    return await this.user_repo.findUserByEmail(email);
  }

  async findUserByName(name: string) {
    return await this.user_repo.findUserByName(name);
  }

  async addUser(user_name: string, user_password: string) {
    const similar_name = await this.user_repo.findUserByName(user_name);
    if (similar_name) {
      throw new ClientError("Sudah ada user dengan nama yang sama!");
    }

    const hashed_password = hashSync(user_password, 10);
    return await this.user_repo.addUser(user_name, hashed_password);
  }

  async getUserDetail(user_id: number) {
    return await this.user_repo.getUserDetail(user_id);
  }

  async findUserByCredentials(user_name: string, user_password: string) {
    const user = await this.user_repo.getLoginCredentials(user_name);
    if (!user) {
      return undefined;
    }
    const is_valid = compareSync(user_password, user.password);
    if (is_valid) {
      return { id: user.id, name: user.name };
    } else {
      return undefined;
    }
  }

  async getUsers(opts?: { is_admin?: boolean; keyword?: string }) {
    return await this.user_repo.getUsers(opts);
  }

  async isAllowedToModify(user_id: number, sender_id: number) {
    if (user_id == sender_id) {
      return true;
    }
    return await this.isAdminUser(sender_id);
  }

  async updateAccountDetail(
    user_id: number,
    obj: {
      user_name?: string;
      user_email?: string;
      user_education_level?: string;
      user_school?: string;
      user_about_me?: string;
      user_image?: string;
      user_password?: string;
    },
    sender_id: number,
  ) {
    const isAllowed = await this.isAllowedToModify(user_id, sender_id);
    if (!isAllowed) {
      throw new AuthError("Anda tidak memiliki akses untuk melakukan hal ini!");
    }

    const { user_password, user_email } = obj;
    let hashed_password: string | undefined = undefined;
    if (user_password) {
      hashed_password = hashSync(user_password, 10);
    }
    if (user_email) {
      const same_email = await this.findUserByEmail(user_email);
      if (same_email != undefined) {
        throw new ClientError("Sudah ada user dengan email yang sama !");
      }
    }
    return await this.user_repo.updateAccountDetails(user_id, {
      ...obj,
      user_password: hashed_password,
    });
  }
}
