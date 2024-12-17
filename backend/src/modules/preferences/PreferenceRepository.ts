import { Kysely } from "kysely";
import { z } from "zod";
import { DB } from "../../db/db_types.js";

const strictPreferenceValidator = z.object({
  project_invite: z.enum(["on", "off"]).default("on"),
  friend_invite: z.enum(["on", "off"]).default("on"),
  project_notif: z.enum(["off", "on", "email"]).default("on"),
  org_notif: z.enum(["off", "on", "email"]).default("on"),
  msg_notif: z.enum(["off", "on", "email"]).default("on"),
  report_notif: z.enum(["off", "on", "email"]).default("on"),
  task_notif: z.enum(["off", "on", "email"]).default("on"),
  contrib_notif: z.enum(["off", "on", "email"]).default("on"),
  friend_notif: z.enum(["off", "on", "email"]).default("on"),
});

const optionalPreferenceValidator = z.object({
  project_invite: z.enum(["on", "off"]).optional(),
  friend_invite: z.enum(["on", "off"]).optional(),
  project_notif: z.enum(["off", "on", "email"]).optional(),
  org_notif: z.enum(["off", "on", "email"]).optional(),
  msg_notif: z.enum(["off", "on", "email"]).optional(),
  report_notif: z.enum(["off", "on", "email"]).optional(),
  task_notif: z.enum(["off", "on", "email"]).optional(),
  contrib_notif: z.enum(["off", "on", "email"]).optional(),
  friend_notif: z.enum(["off", "on", "email"]).optional(),
});

export type ReadablePreference = z.infer<typeof strictPreferenceValidator>;
export type WritablePreference = z.infer<typeof optionalPreferenceValidator>;

export class PreferenceRepository {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async getUserPreference(user_id: number): Promise<ReadablePreference> {
    const query_result = await this.db
      .selectFrom("preferences_users")
      .innerJoin("preferences", "preferences.id", "preferences_users.preference_id")
      .select(["preferences_users.value", "preferences.name"])
      .where("user_id", "=", user_id)
      .execute();

    const obj: Record<string, string> = {};
    for (const { name, value } of query_result) {
      obj[name] = value;
    }

    const result = strictPreferenceValidator.parse(obj);

    return result;
  }

  async saveUserPreference(user_id: number, pref: WritablePreference) {
    const res = optionalPreferenceValidator.parse(pref);

    const modified_keys = Object.keys(res);
    const key_refs = await this.db
      .selectFrom("preferences")
      .select(["id", "name"])
      .where("preferences.name", "in", modified_keys)
      .execute();
    const key_map: Record<string, number> = {};
    key_refs.forEach((x) => {
      key_map[x.name] = x.id;
    });

    const to_insert = Object.entries(res)
      .map(([key, val]) => {
        return {
          preference_id: key_map[key],
          user_id,
          value: val,
        };
      })
      .filter((x) => x.value != undefined);

    await this.db
      .insertInto("preferences_users")
      .values(to_insert)
      .onConflict((oc) =>
        oc.columns(["user_id", "preference_id"]).doUpdateSet((eb) => ({
          value: eb.ref("excluded.value"),
        })),
      )
      .execute();
  }
}
