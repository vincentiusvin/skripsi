import { ExpressionBuilder, Kysely } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { DB } from "../../db/db_types.js";

const defaultUserFields = (eb: ExpressionBuilder<DB, "ms_users">) =>
  [
    "ms_users.id as user_id",
    "ms_users.name as user_name",
    "ms_users.email as user_email",
    "ms_users.education_level as user_education_level",
    "ms_users.school as user_school",
    "ms_users.about_me as user_about_me",
    "ms_users.image as user_image",
    "ms_users.is_admin as user_is_admin",
    "ms_users.created_at as user_created_at",
    "ms_users.website as user_website",
    userWithSocials(eb).as("user_socials"),
  ] as const;

const reducedFields = ["ms_users.id as user_id", "ms_users.name as user_name"] as const;

function userWithSocials(eb: ExpressionBuilder<DB, "ms_users">) {
  return jsonArrayFrom(
    eb
      .selectFrom("socials_users")
      .innerJoin("ms_users", "socials_users.user_id", "ms_users.id")
      .select(["socials_users.social"])
      .whereRef("socials_users.user_id", "=", "ms_users.id"),
  );
}

export class UserRepository {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async findUserByName(user_name: string) {
    return await this.db
      .selectFrom("ms_users")
      .select(reducedFields)
      .where("ms_users.name", "=", user_name)
      .executeTakeFirst();
  }

  async findUserByEmail(email: string) {
    return await this.db
      .selectFrom("ms_users")
      .select(defaultUserFields)
      .where("ms_users.email", "=", email)
      .executeTakeFirst();
  }

  async getUsers(opts?: { is_admin?: boolean; keyword?: string }) {
    const { is_admin, keyword } = opts ?? {};
    let query = this.db.selectFrom("ms_users").select(defaultUserFields);

    if (is_admin) {
      query = query.where("is_admin", "=", is_admin);
    }

    if (keyword != undefined) {
      query = query.where("ms_users.name", "ilike", `%${keyword}%`);
    }

    return await query.execute();
  }

  async addUser(obj: {
    user_name: string;
    user_email: string;
    hashed_password: string;
    user_education_level?: string | undefined;
    user_school?: string | undefined;
    user_about_me?: string | undefined;
    user_image?: string | undefined;
    user_website?: string | undefined;
    user_socials?: string[];
  }) {
    const {
      user_name,
      user_email,
      hashed_password,
      user_education_level,
      user_school,
      user_about_me,
      user_image,
      user_website,
      user_socials,
    } = obj;

    const user_id = await this.db
      .insertInto("ms_users")
      .values({
        name: user_name,
        password: hashed_password,
        email: user_email,
        education_level: user_education_level,
        school: user_school,
        about_me: user_about_me,
        image: user_image,
        website: user_website,
      })
      .returning("ms_users.id")
      .executeTakeFirst();

    if (user_id == undefined) {
      throw new Error("Gagal memasukkan data pengguna!");
    }

    if (user_socials != undefined && user_socials.length) {
      await this.db
        .insertInto("socials_users")
        .values(
          user_socials.map((x) => ({
            user_id: user_id.id,
            social: x,
          })),
        )
        .execute();
    }
    return user_id;
  }

  async getLoginCredentials(user_name: string) {
    return await this.db
      .selectFrom("ms_users")
      .select(["name", "password", "id"])
      .where("ms_users.name", "=", user_name)
      .executeTakeFirst();
  }

  async getUserDetail(id: number) {
    return await this.db
      .selectFrom("ms_users")
      .select(defaultUserFields)
      .where("ms_users.id", "=", id)
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
      user_website?: string;
      hashed_password?: string;
      user_socials?: string[];
    },
  ) {
    const { user_socials, ...main_update } = obj;

    const should_main_update = Object.values(main_update).some((x) => x !== undefined);

    if (should_main_update) {
      const {
        user_name,
        hashed_password,
        user_email,
        user_education_level,
        user_school,
        user_about_me,
        user_image,
        user_website,
      } = main_update;

      await this.db
        .updateTable("ms_users")
        .set({
          name: user_name,
          password: hashed_password,
          email: user_email,
          education_level: user_education_level,
          school: user_school,
          about_me: user_about_me,
          image: user_image,
          website: user_website,
        })
        .where("id", "=", id)
        .execute();
    }

    if (user_socials != undefined && user_socials.length !== 0) {
      await this.db.deleteFrom("socials_users").where("user_id", "=", id).execute();

      await this.db
        .insertInto("socials_users")
        .values(
          user_socials.map((x) => ({
            user_id: id,
            social: x,
          })),
        )
        .execute();
    }
  }
}
