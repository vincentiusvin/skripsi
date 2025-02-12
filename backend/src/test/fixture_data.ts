import { hashSync } from "bcryptjs";
import dayjs from "dayjs";
import { Kysely } from "kysely";
import { DB } from "../db/db_types.js";

export async function baseCase(db: Kysely<DB>) {
  const org = await db
    .insertInto("orgs")
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
    .insertInto("users")
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
      {
        name: "article user",
        password: hashed,
        email: "articleuser@example.com",
      },
      {
        name: "article liker",
        password: hashed,
        email: "articleliker@example.com",
      },
      {
        name: "article commenter",
        password: hashed,
        email: "articlecommenter@example.com",
      },
      {
        name: "chat user 2",
        password: hashed,
        email: "secondchatuser@example.com",
      },
    ])
    .returning(["id", "name", "email"])
    .execute();

  const admin_user_query = await db
    .selectFrom("users")
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
  const article_user = { ...user_ids[15], password: orig_password };
  const article_liker = { ...user_ids[16], password: orig_password };
  const article_commenter = { ...user_ids[17], password: orig_password };
  const chat_user_2 = { ...user_ids[18], password: orig_password };

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
    .insertInto("projects")
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
    .insertInto("task_buckets")
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
    .returning(["task_buckets.id", "task_buckets.name"])
    .execute();

  const task = await db
    .insertInto("tasks")
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
    .returning(["tasks.id", "tasks.name"])
    .execute();

  const chats = await db
    .insertInto("chatrooms")
    .values([
      {
        name: "Chatroom Base Case",
      },
      {
        name: "punya proyek",
        project_id: project.id,
      },
    ])
    .returning(["chatrooms.id", "chatrooms.name"])
    .execute();

  const chat = chats[0];
  const project_chat = chats[1];

  await db
    .insertInto("chatrooms_users")
    .values([
      {
        chatroom_id: chat.id,
        user_id: chat_user.id,
      },
      {
        chatroom_id: chat.id,
        user_id: chat_user_2.id,
      },
    ])
    .execute();

  const message = await db
    .insertInto("messages")
    .values(
      Array(10)
        .fill(undefined)
        .map(() => ({
          chatroom_id: chat.id,
          message: "testing message",
          user_id: user_ids[2].id,
        })),
    )
    .returning(["messages.id", "messages.message", "messages.user_id", "messages.chatroom_id"])
    .executeTakeFirstOrThrow();

  await db
    .insertInto("friends")
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
    .insertInto("category_orgs")
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
    .insertInto("category_projects")
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
    .insertInto("contributions")
    .values(_contributions.map((x) => ({ ...x, user_ids: undefined })))
    .returning(["id", "name", "description", "project_id", "status"])
    .execute();

  await db
    .insertInto("contributions_users")
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
    .insertInto("notifications")
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
    .insertInto("reports")
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
    .returning(["id", "reports.status", "reports.title", "reports.description"])
    .execute();

  const bans = await db
    .insertInto("suspensions")
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
    .returning(["id", "suspensions.reason", "suspensions.suspended_until"])
    .execute();
  const active_ban = bans[0];
  const expired_ban = bans[1];

  const pref_map = await db
    .selectFrom("preferences")
    .select(["preferences.id", "preferences.name"])
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
    .selectFrom("preferences")
    .innerJoin("preferences_users", "preferences_users.preference_id", "preferences.id")
    .select(["preferences.name", "preferences_users.value"])
    .where("user_id", "=", pref_user.id)
    .execute();
  const preferences: Record<string, string> = {};
  preferences_tidy.forEach((x) => {
    preferences[x.name] = x.value;
  });

  const verified_otp = await db
    .insertInto("otps")
    .values({
      email: "email-otp1@example.com",
      otp: "123456",
      verified_at: new Date(),
      type: "Register",
    })
    .returning(["token", "email", "otp", "verified_at"])
    .executeTakeFirstOrThrow();

  const used_otp = await db
    .insertInto("otps")
    .values({
      email: "email-otp2@example.com",
      otp: "123456",
      verified_at: new Date(),
      type: "Register",
      used_at: new Date(),
    })
    .returning(["token", "email", "otp", "verified_at"])
    .executeTakeFirstOrThrow();

  const password_otp = await db
    .insertInto("otps")
    .values({
      email: plain_user.email,
      otp: "123456",
      verified_at: new Date(),
      type: "Password",
    })
    .returning(["token", "email", "otp", "verified_at"])
    .executeTakeFirstOrThrow();

  const unverified_otp = await db
    .insertInto("otps")
    .values({
      email: "email-otp2@example.com",
      otp: "89765",
      type: "Register",
    })
    .returning(["token", "email", "otp", "verified_at"])
    .executeTakeFirstOrThrow();

  const article = await db
    .insertInto("articles")
    .values({
      name: "Testing article",
      description: "Very informative article",
      content: "abcdefgh",
      user_id: article_user.id,
    })
    .returning(["id", "name", "description", "content", "image"])
    .executeTakeFirstOrThrow();

  await db
    .insertInto("articles_likes")
    .values({
      user_id: article_liker.id,
      article_id: article.id,
    })
    .returning(["article_id", "user_id"])
    .execute();

  const comment = await db
    .insertInto("comments")
    .values({
      article_id: article.id,
      comment: "Testing comment",
      user_id: article_commenter.id,
    })
    .returning(["id", "user_id", "comments.comment"])
    .execute();

  return {
    article,
    comment,
    article_liker,
    article_user,
    verified_otp,
    unverified_otp,
    password_otp,
    used_otp,
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
    chat_user_2,
    dev_user,
    admin_user,
    project_admin_user,
    friend_acc_user,
    friend_recv_user,
    friend_send_user,
    chat,
    message,
    user_contribution,
    article_commenter,
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
