import { ExpressionBuilder, Kysely, SelectQueryBuilder } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { DB } from "../../db/db_types.js";
import { paginateQuery } from "../../helpers/pagination.js";
import { OTPTypes, parseOTPTypes } from "./UserMisc.js";

const defaultUserFields = (eb: ExpressionBuilder<DB, "users">) =>
  [
    "users.id as user_id",
    "users.name as user_name",
    "users.email as user_email",
    "users.education_level as user_education_level",
    "users.school as user_school",
    "users.about_me as user_about_me",
    "users.image as user_image",
    "users.is_admin as user_is_admin",
    "users.created_at as user_created_at",
    "users.website as user_website",
    "users.location as user_location",
    "users.workplace as user_workplace",
    userWithSocials(eb).as("user_socials"),
  ] as const;

const reducedFields = ["users.id as user_id", "users.name as user_name"] as const;

function userWithSocials(eb: ExpressionBuilder<DB, "users">) {
  return jsonArrayFrom(
    eb
      .selectFrom("socials_users")
      .select(["socials_users.social"])
      .whereRef("socials_users.user_id", "=", "users.id"),
  );
}

const defaultOTPFields = [
  "otps.token",
  "otps.email",
  "otps.otp",
  "otps.used_at",
  "otps.created_at",
  "otps.verified_at",
  "otps.type",
] as const;

export class UserRepository {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async findUserByName(user_name: string) {
    return await this.db
      .selectFrom("users")
      .select(reducedFields)
      .where("users.name", "=", user_name)
      .executeTakeFirst();
  }

  async getOTP(token: string) {
    const result = await this.db
      .selectFrom("otps")
      .select(defaultOTPFields)
      .where("otps.token", "=", token)
      .executeTakeFirst();

    if (result == undefined) {
      return undefined;
    }

    const { type, ...rest } = result;

    return {
      ...rest,
      type: parseOTPTypes(type),
    };
  }

  async addOTP(obj: { email: string; otp: string; type: OTPTypes }) {
    const { type, email, otp } = obj;
    return await this.db
      .insertInto("otps")
      .values({
        email,
        otp,
        type,
      })
      .returning(["token"])
      .executeTakeFirst();
  }

  async updateOTP(
    token: string,
    obj: {
      verified_at?: Date;
      used_at?: Date;
    },
  ) {
    const { used_at, verified_at } = obj;
    return await this.db
      .updateTable("otps")
      .set({
        verified_at,
        used_at,
      })
      .where("token", "=", token)
      .execute();
  }

  async findUserByEmail(email: string) {
    return await this.db
      .selectFrom("users")
      .select(defaultUserFields)
      .where("users.email", "=", email)
      .executeTakeFirst();
  }

  applyFilterToQuery<O>(
    query: SelectQueryBuilder<DB, "users", O>,
    filter?: { keyword?: string; is_admin?: boolean },
  ) {
    const { is_admin, keyword } = filter ?? {};
    if (is_admin) {
      query = query.where("is_admin", "=", is_admin);
    }

    if (keyword != undefined) {
      query = query.where("users.name", "ilike", `%${keyword}%`);
    }

    return query;
  }

  async countUsers(opts?: { is_admin?: boolean; keyword?: string }) {
    const { is_admin, keyword } = opts ?? {};

    let query = this.db.selectFrom("users").select((eb) => eb.fn.countAll().as("count"));
    query = this.applyFilterToQuery(query, { is_admin, keyword });
    return await query.executeTakeFirstOrThrow();
  }

  async getUsers(opts?: { is_admin?: boolean; keyword?: string; limit?: number; page?: number }) {
    const { page, limit, is_admin, keyword } = opts ?? {};
    let query = this.db.selectFrom("users").select(defaultUserFields).orderBy("id asc");

    query = this.applyFilterToQuery(query, { is_admin, keyword });
    query = paginateQuery(query, {
      page,
      limit,
    });

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
    user_location?: string;
    user_workplace?: string;
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
      user_location,
      user_workplace,
    } = obj;

    const user_id = await this.db
      .insertInto("users")
      .values({
        name: user_name,
        password: hashed_password,
        email: user_email,
        education_level: user_education_level,
        school: user_school,
        about_me: user_about_me,
        image: user_image,
        website: user_website,
        location: user_location,
        workplace: user_workplace,
      })
      .returning("users.id")
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
      .selectFrom("users")
      .select(["name", "password", "id"])
      .where("users.name", "=", user_name)
      .executeTakeFirst();
  }

  async getUserDetail(id: number) {
    return await this.db
      .selectFrom("users")
      .select(defaultUserFields)
      .where("users.id", "=", id)
      .executeTakeFirst();
  }

  async updateAccountDetails(
    id: number,
    obj: {
      user_name?: string;
      user_email?: string;
      user_education_level?: string | null;
      user_school?: string | null;
      user_about_me?: string | null;
      user_image?: string | null;
      hashed_password?: string;
      user_website?: string | null;
      user_socials?: string[];
      user_location?: string | null;
      user_workplace?: string | null;
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
        user_location,
        user_workplace,
      } = main_update;

      await this.db
        .updateTable("users")
        .set({
          name: user_name,
          password: hashed_password,
          email: user_email,
          education_level: user_education_level,
          school: user_school,
          about_me: user_about_me,
          image: user_image,
          website: user_website,
          location: user_location,
          workplace: user_workplace,
        })
        .where("id", "=", id)
        .execute();
    }

    if (user_socials != undefined) {
      await this.db.deleteFrom("socials_users").where("user_id", "=", id).execute();

      if (user_socials.length !== 0) {
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
}
