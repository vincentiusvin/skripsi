import { Kysely } from "kysely";
import { z } from "zod";
import { DB } from "../../db/db_types.js";

const defaultPreferenceKeys = [
  "contrib_notif",
  "friend_invite",
  "friend_notif",
  "msg_notif",
  "org_notif",
  "project_invite",
  "project_notif",
  "report_notif",
  "task_notif",
] as const;

const strictPreferenceValidator = z.object({
  project_invite: z.boolean().default(true),
  friend_invite: z.boolean().default(true),
  project_notif: z.enum(["off", "on", "email"]).default("on"),
  org_notif: z.enum(["off", "on", "email"]).default("on"),
  msg_notif: z.enum(["off", "on", "email"]).default("on"),
  report_notif: z.enum(["off", "on", "email"]).default("on"),
  task_notif: z.enum(["off", "on", "email"]).default("on"),
  contrib_notif: z.enum(["off", "on", "email"]).default("on"),
  friend_notif: z.enum(["off", "on", "email"]).default("on"),
});

const optionalPreferenceValidator = z.object({
  project_invite: z.boolean().optional(),
  friend_invite: z.boolean().optional(),
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
      .selectFrom("ms_preferences")
      .select(defaultPreferenceKeys)
      .where("user_id", "=", user_id)
      .executeTakeFirst();

    const result = strictPreferenceValidator.parse(query_result ?? {});

    return result;
  }

  async saveUserPreference(user_id: number, pref: WritablePreference) {
    const res = optionalPreferenceValidator.parse(pref);
    await this.db.updateTable("ms_preferences").set(res).where("user_id", "=", user_id).execute();
  }
}
