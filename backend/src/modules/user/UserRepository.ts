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
  async getAccountDetails(id: number) {
    return await this.db
      .selectFrom("ms_users")
      .select([
        "ms_users.id as user_id",
        "ms_users.name as user_name",
        "ms_users.password as user_password",
        "ms_users.email as user_email",
        "ms_users.education_level as user_education_level",
        "ms_users.school as user_school",
        "ms_users.about_me as user_about_me",
        "ms_users.image as user_image",
      ])
      .where("ms_users.id", "=", id)
      .executeTakeFirst();
  }

  async getUserAccountByEmail(email: string) {
    return await this.db
      .selectFrom("ms_users")
      .select([
        "ms_users.id as user_id",
        "ms_users.password as user_password",
        "ms_users.email as user_email",
        "ms_users.education_level as user_education_level",
        "ms_users.school as user_school",
        "ms_users.about_me as user_about_me",
      ])
      .where("ms_users.email", "=", email)
      .executeTakeFirst();
  }

  async updateAccountDetails(
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
    const {
      user_name,
      user_password,
      user_email,
      user_education_level,
      user_school,
      user_about_me,
      user_image,
    } = obj;

    await this.db.transaction().execute(async (trx) => {
      if (
        user_name != undefined ||
        user_password != undefined ||
        user_email != undefined ||
        user_education_level != undefined ||
        user_school != undefined ||
        user_about_me != undefined ||
        user_image != undefined
      ) {
        const user = await trx
          .updateTable("ms_users")
          .set({
            name: user_name,
            password: user_password,
            email: user_email,
            education_level: user_education_level,
            school: user_school,
            about_me: user_about_me,
            ...(user_image && { image: user_image }),
          })
          .where("id", "=", id)
          .executeTakeFirst();
        if (!user) {
          throw new Error("Data tidak di update");
        }
      }
    });
  }
}
