import { Kysely } from "kysely";
import { DB } from "../../db/db_types.js";

export class UserRepository {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async findUserByName(user_name: string) {
    return await this.db
      .selectFrom("ms_users")
      .select(["ms_users.id as user_id", "ms_users.name as user_name"])
      .where("ms_users.name", "=", user_name)
      .executeTakeFirst();
  }

  async getUsers() {
    return await this.db
      .selectFrom("ms_users")
      .select(["ms_users.id as user_id", "ms_users.name as user_name"])
      .execute();
  }

  async findUserByID(user_id: number) {
    return await this.db
      .selectFrom("ms_users")
      .select(["ms_users.id as user_id", "ms_users.name as user_name"])
      .where("ms_users.id", "=", user_id)
      .executeTakeFirst();
  }

  async addUser(user_name: string, hashed_password: string) {
    return await this.db
      .insertInto("ms_users")
      .values({
        name: user_name,
        password: hashed_password,
      })
      .returning("ms_users.id")
      .executeTakeFirst();
  }
}
