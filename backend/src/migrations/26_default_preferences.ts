import { Kysely } from "kysely";
import { DB } from "../db/db_types.js";

export async function up(db: Kysely<DB>): Promise<void> {
  const prefs = [
    "contrib_notif",
    "friend_invite",
    "friend_notif",
    "msg_notif",
    "org_notif",
    "project_invite",
    "project_notif",
    "report_notif",
    "task_notif",
  ];

  await db
    .insertInto("ms_preferences")
    .values(
      prefs.map((x) => ({
        name: x,
      })),
    )
    .execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.deleteFrom("ms_preferences").execute();
}
