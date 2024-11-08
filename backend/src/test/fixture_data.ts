import { hashSync } from "bcryptjs";
import dayjs from "dayjs";
import { Kysely } from "kysely";
import { DB } from "../db/db_types.js";

export async function baseCase(db: Kysely<DB>) {
  const org = await db
    .insertInto("ms_orgs")
    .values({
      name: "testing org",
      address: "jakarta",
      description: "very kind org",
      phone: "01234",
    })
    .returning(["id", "name"])
    .executeTakeFirstOrThrow();

  const orig_password = "halo";
  const hashed = hashSync(orig_password, 10);
  const user_ids = await db
    .insertInto("ms_users")
    .values([
      {
        name: "org user",
        password: hashed,
        email: "orguser@example.com",
      },
      {
        name: "external user",
        password: hashed,
        email: "extuser@example.com",
      },
      {
        name: "chat user",
        password: hashed,
        email: "chatuser@example.com",
      },
      {
        name: "project dev",
        password: hashed,
        email: "projectdev@example.com",
      },
      {
        name: "project admin",
        password: hashed,
        email: "projectadmin@example.com",
      },
      {
        name: "friend send",
        password: hashed,
        email: "friendsend@example.com",
      },
      {
        name: "friend pending",
        password: hashed,
        email: "friendpending@example.com",
      },
      {
        name: "friend acc",
        password: hashed,
        email: "friendacc@example.com",
      },
      {
        name: "notif user",
        password: hashed,
        email: "notifuser@example.com",
      },
      {
        name: "report user",
        password: hashed,
        email: "reportuser@example.com",
      },
      {
        name: "banned user",
        password: hashed,
        email: "banneduser@example.com",
      },
      {
        name: "pref user",
        password: hashed,
        email: "prefuser@example.com",
      },
      {
        name: "contrib user",
        password: hashed,
        email: "contribuser@example.com",
      },
      {
        name: "expired ban user",
        password: hashed,
        email: "expiredban@example.com",
      },
      {
        name: "email chat user",
        password: hashed,
        email: "emailchat@example.com",
      },
    ])
    .returning(["id", "name"])
    .execute();

  const admin_user_query = await db
    .selectFrom("ms_users")
    .select(["id", "name"])
    .where("is_admin", "=", true)
    .executeTakeFirstOrThrow();

  const admin_user = { ...admin_user_query, password: process.env.ADMIN_PASSWORD! };
  const org_user = { ...user_ids[0], password: orig_password };
  const plain_user = { ...user_ids[1], password: orig_password };
  const chat_user = { ...user_ids[2], password: orig_password };
  const dev_user = { ...user_ids[3], password: orig_password };
  const project_admin_user = { ...user_ids[4], password: orig_password };
  const friend_send_user = { ...user_ids[5], password: orig_password };
  const friend_recv_user = { ...user_ids[6], password: orig_password };
  const friend_acc_user = { ...user_ids[7], password: orig_password };
  const notif_user = { ...user_ids[8], password: orig_password };
  const report_user = { ...user_ids[9], password: orig_password };
  const banned_user = { ...user_ids[10], password: orig_password };
  const pref_user = { ...user_ids[11], password: orig_password };
  const contrib_user = { ...user_ids[12], password: orig_password };
  const expired_banned_user = { ...user_ids[13], password: orig_password };
  const email_chat_user = { ...user_ids[14], password: orig_password };

  await db
    .insertInto("orgs_users")
    .values([
      {
        org_id: org.id,
        user_id: org_user.id,
        role: "Admin",
      },
      {
        org_id: org.id,
        user_id: project_admin_user.id,
        role: "Admin",
      },
    ])
    .execute();

  const projects = await db
    .insertInto("ms_projects")
    .values([
      {
        description: "very awesome project",
        name: "testing project",
        org_id: org.id,
      },
      {
        description: "very awesome project",
        name: "testing project",
        org_id: org.id,
      },
    ])
    .returning(["id", "name"])
    .execute();

  const project = projects[0];
  const empty_project = projects[1];

  await db
    .insertInto("projects_users")
    .values([
      {
        project_id: project.id,
        role: "Dev",
        user_id: dev_user.id,
      },
      {
        project_id: project.id,
        role: "Admin",
        user_id: project_admin_user.id,
      },
    ])
    .execute();

  const bucket = await db
    .insertInto("ms_task_buckets")
    .values([
      {
        name: "Todo",
        project_id: project.id,
      },
      {
        name: "Todo2",
        project_id: project.id,
      },
    ])
    .returning(["ms_task_buckets.id", "ms_task_buckets.name"])
    .execute();

  const task = await db
    .insertInto("ms_tasks")
    .values([
      {
        name: "Todo",
        bucket_id: bucket[0].id,
        order: 1,
      },
      {
        name: "Todo2",
        bucket_id: bucket[0].id,
        order: 2,
      },
    ])
    .returning(["ms_tasks.id", "ms_tasks.name"])
    .execute();

  const chats = await db
    .insertInto("ms_chatrooms")
    .values([
      {
        name: "Chatroom Base Case",
      },
      {
        name: "punya proyek",
        project_id: project.id,
      },
    ])
    .returning(["ms_chatrooms.id", "ms_chatrooms.name"])
    .execute();

  const chat = chats[0];
  const project_chat = chats[1];

  await db
    .insertInto("chatrooms_users")
    .values({
      chatroom_id: chat.id,
      user_id: chat_user.id,
    })
    .execute();

  const message = await db
    .insertInto("ms_messages")
    .values({
      chatroom_id: chat.id,
      message: "testing message",
      user_id: user_ids[2].id,
    })
    .returning([
      "ms_messages.id",
      "ms_messages.message",
      "ms_messages.user_id",
      "ms_messages.chatroom_id",
    ])
    .executeTakeFirstOrThrow();

  await db
    .insertInto("ms_friends")
    .values([
      {
        from_user_id: friend_send_user.id,
        to_user_id: friend_recv_user.id,
        status: "Pending",
      },
      {
        from_user_id: friend_send_user.id,
        to_user_id: friend_acc_user.id,
        status: "Accepted",
      },
    ])
    .execute();

  const org_categories = await db
    .insertInto("ms_category_orgs")
    .values([
      {
        name: "Cat1",
      },
      {
        name: "Cat2",
      },
    ])
    .returning(["id", "name"])
    .execute();

  const project_categories = await db
    .insertInto("ms_category_projects")
    .values([
      {
        name: "Cat1",
      },
      {
        name: "Cat2",
      },
    ])
    .returning(["id", "name"])
    .execute();

  const _contributions = [
    {
      name: "bla",
      description: "bla2",
      project_id: project.id,
      status: "Pending",
      user_ids: [contrib_user.id].map((x) => ({ user_id: x })),
    },
    {
      name: "bla",
      description: "bla2",
      project_id: project.id,
      status: "Pending",
      user_ids: [contrib_user.id, project_admin_user.id].map((x) => ({ user_id: x })),
    },
    {
      name: "bla",
      description: "bla2",
      project_id: project.id,
      status: "Approved",
      user_ids: [contrib_user.id].map((x) => ({ user_id: x })),
    },
    {
      name: "bla",
      description: "bla2",
      project_id: project.id,
      status: "Rejected",
      user_ids: [contrib_user.id].map((x) => ({ user_id: x })),
    },
  ];

  const contrib_raw = await db
    .insertInto("ms_contributions")
    .values(_contributions.map((x) => ({ ...x, user_ids: undefined })))
    .returning(["id", "name", "description", "project_id", "status"])
    .execute();

  await db
    .insertInto("ms_contributions_users")
    .values(
      _contributions.flatMap((x, i) => {
        return x.user_ids.map((y) => ({
          user_id: y.user_id,
          contributions_id: contrib_raw[i].id,
        }));
      }),
    )
    .returning("user_id")
    .execute();

  const contributions = _contributions.map((x, i) => {
    return {
      ...x,
      id: contrib_raw[i].id,
    };
  });
  const user_contribution = contributions[0];
  const admin_contribution = contributions[1];
  const accepted_contribution = contributions[2];
  const rejected_contribution = contributions[3];

  const notifications = await db
    .insertInto("ms_notifications")
    .values([
      {
        title: "Testing",
        description: "test desc",
        type: "Proyek",
        user_id: notif_user.id,
      },
      {
        title: "Testing",
        description: "test desc",
        type: "Organisasi",
        user_id: notif_user.id,
      },
    ])
    .returning(["id", "title", "description", "type", "user_id"])
    .execute();

  const reports = await db
    .insertInto("ms_reports")
    .values([
      {
        title: "Report Testing",
        description: "report test desc",
        sender_id: report_user.id,
        status: "Pending",
      },
      {
        title: "Report Testing 2",
        description: "report test desc",
        sender_id: report_user.id,
        status: "Pending",
      },
    ])
    .returning(["id", "ms_reports.status", "ms_reports.title", "ms_reports.description"])
    .execute();

  const bans = await db
    .insertInto("ms_suspensions")
    .values([
      {
        reason: "Kurang beruntung",
        suspended_until: dayjs().add(100, "day").toDate(),
        user_id: banned_user.id,
      },
      {
        reason: "Sudah expired",
        suspended_until: dayjs().subtract(100, "day").toDate(),
        user_id: expired_banned_user.id,
      },
    ])
    .returning(["id", "ms_suspensions.reason", "ms_suspensions.suspended_until"])
    .execute();
  const active_ban = bans[0];
  const expired_ban = bans[1];

  const pref_map = await db
    .selectFrom("ms_preferences")
    .select(["ms_preferences.id", "ms_preferences.name"])
    .execute();

  await db
    .insertInto("preferences_users")
    .values([
      {
        user_id: pref_user.id,
        preference_id: pref_map.find((x) => x.name === "project_invite")!.id,
        value: "off",
      },
      {
        user_id: pref_user.id,
        preference_id: pref_map.find((x) => x.name === "project_notif")!.id,
        value: "email",
      },
      {
        user_id: pref_user.id,
        preference_id: pref_map.find((x) => x.name === "friend_invite")!.id,
        value: "off",
      },
      {
        user_id: email_chat_user.id,
        preference_id: pref_map.find((x) => x.name === "msg_notif")!.id,
        value: "email",
      },
    ])
    .execute();

  const preferences_tidy = await db
    .selectFrom("ms_preferences")
    .innerJoin("preferences_users", "preferences_users.preference_id", "ms_preferences.id")
    .select(["ms_preferences.name", "preferences_users.value"])
    .where("user_id", "=", pref_user.id)
    .execute();
  const preferences: Record<string, string> = {};
  preferences_tidy.forEach((x) => {
    preferences[x.name] = x.value;
  });

  return {
    project_chat,
    org,
    preferences,
    project,
    bucket_fill: bucket[0],
    bucket_empty: bucket[1],
    pref_user,
    org_categories,
    project_categories,
    task,
    org_user,
    plain_user,
    chat_user,
    dev_user,
    admin_user,
    project_admin_user,
    friend_acc_user,
    friend_recv_user,
    friend_send_user,
    chat,
    message,
    user_contribution,
    admin_contribution,
    notifications,
    notif_user,
    reports,
    contrib_user,
    report_user,
    empty_project,
    expired_banned_user,
    accepted_contribution,
    email_chat_user,
    rejected_contribution,
    active_ban,
    expired_ban,
    banned_user,
  };
}
