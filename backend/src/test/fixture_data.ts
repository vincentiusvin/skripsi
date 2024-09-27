import { hashSync } from "bcryptjs";
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
  const user_ids = await db
    .insertInto("ms_users")
    .values([
      {
        name: "org user",
        password: hashSync(orig_password, 10),
      },
      {
        name: "external user",
        password: hashSync(orig_password, 10),
      },
      {
        name: "chat user",
        password: hashSync(orig_password, 10),
      },
      {
        name: "project dev",
        password: hashSync(orig_password, 10),
      },
      {
        name: "project admin",
        password: hashSync(orig_password, 10),
      },
      {
        name: "friend send",
        password: hashSync(orig_password, 10),
      },
      {
        name: "friend pending",
        password: hashSync(orig_password, 10),
      },
      {
        name: "friend acc",
        password: hashSync(orig_password, 10),
      },
      {
        name: "notif user",
        password: hashSync(orig_password, 10),
      },
    ])
    .returning(["id", "name"])
    .execute();

  const org_user = { ...user_ids[0], password: orig_password };
  const plain_user = { ...user_ids[1], password: orig_password };
  const chat_user = { ...user_ids[2], password: orig_password };
  const dev_user = { ...user_ids[3], password: orig_password };
  const project_admin_user = { ...user_ids[4], password: orig_password };
  const friend_send_user = { ...user_ids[5], password: orig_password };
  const friend_recv_user = { ...user_ids[6], password: orig_password };
  const friend_acc_user = { ...user_ids[7], password: orig_password };
  const notif_user = { ...user_ids[8], password: orig_password };

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

  const project = await db
    .insertInto("ms_projects")
    .values({
      description: "very awesome project",
      name: "testing project",
      org_id: org.id,
    })
    .returning(["id", "name"])
    .executeTakeFirstOrThrow();

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

  const chat = await db
    .insertInto("ms_chatrooms")
    .values({
      name: "Chatroom Base Case",
    })
    .returning(["ms_chatrooms.id", "ms_chatrooms.name"])
    .executeTakeFirstOrThrow();

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

  const contributions = await db
    .insertInto("ms_contributions")
    .values({
      name: "bla",
      description: "bla2",
      project_id: project.id,
      status: "pending",
    })
    .returning(["id", "name", "description", "project_id", "status"])
    .execute();

  const notifications = await db
    .insertInto("ms_notifications")
    .values({
      title: "Testing",
      description: "test desc",
      type: "OrgManage",
      user_id: notif_user.id,
    })
    .returning(["id", "title", "description", "type", "user_id"])
    .execute();

  return {
    org,
    project,
    bucket_fill: bucket[0],
    bucket_empty: bucket[1],
    org_categories,
    project_categories,
    task,
    org_user,
    plain_user,
    chat_user,
    dev_user,
    project_admin_user,
    friend_acc_user,
    friend_recv_user,
    friend_send_user,
    chat,
    message,
    contributions,
    notifications,
    notif_user,
  };
}
