import { Kysely } from "kysely";
import { DB } from "../../db/db_types.js";

const defaultSuspensionFields = [
  "ms_suspensions.id",
  "ms_suspensions.user_id",
  "ms_suspensions.suspended_until",
  "ms_suspensions.reason",
  "ms_suspensions.created_at",
] as const;

export class SuspensionRepository {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async addSuspension(opts: { reason: string; user_id: number; suspended_until: Date }) {
    const { reason, user_id, suspended_until } = opts;
    return await this.db
      .insertInto("ms_suspensions")
      .values({
        reason,
        user_id,
        suspended_until,
      })
      .returning("id")
      .executeTakeFirst();
  }

  async deleteSuspension(suspension_id: number) {
    await this.db.deleteFrom("ms_suspensions").where("id", "=", suspension_id).execute();
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

    if (Object.keys(updated_obj).some((x) => x != undefined)) {
      return await this.db
        .updateTable("ms_suspensions")
        .set(updated_obj)
        .where("id", "=", suspension_id)
        .execute();
    }
  }

  async getSuspension() {
    return await this.db.selectFrom("ms_suspensions").select(defaultSuspensionFields).execute();
  }

  async isUserSuspended(user_id: number) {
    const res = await this.db
      .selectFrom("ms_suspensions")
      .select("id")
      .where((eb) =>
        eb.and([
          eb("user_id", "=", user_id),
          eb("ms_suspensions.suspended_until", ">=", new Date()),
        ]),
      )
      .execute();
    return res != undefined;
  }

  async getSuspensionByID(suspension_id: number) {
    return await this.db
      .selectFrom("ms_suspensions")
      .select(defaultSuspensionFields)
      .where("id", "=", suspension_id)
      .executeTakeFirst();
  }
}
