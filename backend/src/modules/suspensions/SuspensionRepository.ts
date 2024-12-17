import { Kysely } from "kysely";
import { DB } from "../../db/db_types.js";

const defaultSuspensionFields = [
  "suspensions.id",
  "suspensions.user_id",
  "suspensions.suspended_until",
  "suspensions.reason",
  "suspensions.created_at",
] as const;

export class SuspensionRepository {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async purgeSession(user_id: number) {
    return await this.db
      .deleteFrom("session")
      .where((eb) => eb(eb.cast("sess", "jsonb"), "@@", `$[*].user_id == ${user_id}`))
      .execute();
  }

  async getLongestActiveSuspension(opts: { user_id: number }) {
    const { user_id } = opts;
    return await this.db
      .selectFrom("suspensions")
      .select(defaultSuspensionFields)
      .where((eb) =>
        eb.and([
          eb("suspensions.user_id", "=", user_id),
          eb("suspensions.suspended_until", ">", new Date()),
        ]),
      )
      .orderBy("suspensions.suspended_until desc")
      .limit(1)
      .executeTakeFirst();
  }

  async addSuspension(opts: { reason: string; user_id: number; suspended_until: Date }) {
    const { reason, user_id, suspended_until } = opts;
    return await this.db
      .insertInto("suspensions")
      .values({
        reason,
        user_id,
        suspended_until,
      })
      .returning("id")
      .executeTakeFirst();
  }

  async deleteSuspension(suspension_id: number) {
    await this.db.deleteFrom("suspensions").where("id", "=", suspension_id).execute();
  }

  async updateSuspension(
    suspension_id: number,
    opts: { reason?: string; user_id?: number; suspended_until?: Date },
  ) {
    const updated_obj = {
      reason: opts.reason,
      user_id: opts.user_id,
      suspended_until: opts.suspended_until,
    };

    if (Object.values(updated_obj).some((x) => x != undefined)) {
      return await this.db
        .updateTable("suspensions")
        .set(updated_obj)
        .where("id", "=", suspension_id)
        .execute();
    }
  }

  async getSuspension(opts: { user_id?: number; expired_before?: Date; expired_after?: Date }) {
    const { user_id, expired_before, expired_after } = opts;
    let query = this.db
      .selectFrom("suspensions")
      .select(defaultSuspensionFields)
      .orderBy("suspensions.suspended_until asc");

    if (user_id != undefined) {
      query = query.where("user_id", "=", user_id);
    }
    if (expired_after != undefined) {
      query = query.where("suspensions.suspended_until", ">", expired_after);
    }
    if (expired_before != undefined) {
      query = query.where("suspensions.suspended_until", "<", expired_before);
    }

    return query.execute();
  }

  async getSuspensionByID(suspension_id: number) {
    return await this.db
      .selectFrom("suspensions")
      .select(defaultSuspensionFields)
      .where("id", "=", suspension_id)
      .executeTakeFirst();
  }
}
