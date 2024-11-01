import { compareSync, hashSync } from "bcryptjs";
import { AuthError, ClientError, NotFoundError } from "../../helpers/error.js";
import { TransactionManager } from "../../helpers/transaction/transaction.js";
import { UserRepository } from "./UserRepository.js";

export function userServiceFactory(transaction_manager: TransactionManager) {
  const db = transaction_manager.getDB();
  const user_repo = new UserRepository(db);
  const user_service = new UserService(user_repo, transaction_manager);
  return user_service;
}

export class UserService {
  private user_repo: UserRepository;
  private transaction_manager: TransactionManager;
  constructor(user_repo: UserRepository, transaction_manager: TransactionManager) {
    this.user_repo = user_repo;
    this.transaction_manager = transaction_manager;
  }
  factory = userServiceFactory;

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

  async addUser(obj: {
    user_name: string;
    user_email: string;
    user_password: string;
    user_education_level?: string;
    user_school?: string;
    user_about_me?: string;
    user_image?: string;
    user_website?: string;
    user_social?: string[];
  }) {
    return await this.transaction_manager.transaction(this as UserService, async (serv) => {
      const { user_name, user_password, user_email, ...rest } = obj;
      const same_name = await serv.user_repo.findUserByName(user_name);
      if (same_name) {
        throw new ClientError("Sudah ada pengguna dengan nama yang sama!");
      }
      const same_email = await serv.findUserByEmail(user_email);
      if (same_email != undefined) {
        throw new ClientError("Sudah ada pengguna dengan email yang sama !");
      }

      const hashed_password = hashSync(user_password, 10);

      return await serv.user_repo.addUser({
        ...rest,
        user_name,
        user_email,
        hashed_password,
      });
    });
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
      user_website?: string;
      user_social?: string[];
    },
    sender_id: number,
  ) {
    return await this.transaction_manager.transaction(this as UserService, async (serv) => {
      const isAllowed = await serv.isAllowedToModify(user_id, sender_id);
      if (!isAllowed) {
        throw new AuthError("Anda tidak memiliki akses untuk mengubah profil ini!");
      }

      const { user_name, user_password, user_email, ...rest } = obj;
      let hashed_password: string | undefined = undefined;
      if (user_password != undefined) {
        hashed_password = hashSync(user_password, 10);
      }

      if (user_email != undefined) {
        const same_email = await serv.findUserByEmail(user_email);
        if (same_email != undefined) {
          throw new ClientError("Sudah ada pengguna dengan email yang sama !");
        }
      }

      if (user_name != undefined) {
        const same_name = await serv.user_repo.findUserByName(user_name);
        if (same_name) {
          throw new ClientError("Sudah ada pengguna dengan nama yang sama!");
        }
      }

      return await serv.user_repo.updateAccountDetails(user_id, {
        ...rest,
        user_email,
        user_name,
        hashed_password: hashed_password,
      });
    });
  }
}
