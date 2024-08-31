import { hashSync } from "bcryptjs";
import { stringify } from "qs";
import { Application } from "../app.js";
import { API } from "../routes.js";

/**
 * Class yang dipakai buat inject typing ke
 * fungsi {@link APIContext#fetch}.
 *
 * Cara pakainya dengan:
 * ```ts
 * new APIContext("key_dari_backend").fetch(url, options)
 * ```
 * atau dengan useQuery:
 * ```ts
 * const { data } = useQuery({
 *   queryKey: ["tests"],
 *   queryFn: () => new APIContext("key_dari_backend").fetch(url, options),
 * });
 * ```
 */
export class APIContext<T extends keyof API> {
  /**
   * @param _key Key API yang di-define di backend
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_key: T) {}

  /**
   * Mirip kaya {@link fetch | fetch API (built-in)}, dengan beberapa perbedaan:
   * Ada type inference.
   * Body dan Query diparse secara otomatis.
   * Content-Type default json
   */
  async fetch(
    url: string,
    options?: Omit<RequestInit, "body"> & {
      body?: API[T]["ReqBody"];
      query?: API[T]["ReqQuery"];
    },
  ): Promise<Omit<Response, "json"> & { json: () => Promise<API[T]["ResBody"]> }> {
    const { query, body } = options || {};
    const urlWithParams = query
      ? url +
        stringify(query, {
          addQueryPrefix: true,
        })
      : url;
    const stringBody = body ? JSON.stringify(body) : null;

    if (!options) {
      options = {};
    }

    if (!(options?.headers instanceof Headers)) {
      options.headers = new Headers(options.headers ? options.headers : {});
    }

    if (!options.headers.has("Content-Type")) {
      options.headers.append("Content-Type", "application/json");
    }

    const res = await fetch(
      `http://${process.env.BACKEND_HOST}:${process.env.BACKEND_PORT}` + urlWithParams,
      {
        ...options,
        body: stringBody,
      },
    );

    return res;
  }
}

export async function baseCase(app: Application) {
  const org = await app.db
    .insertInto("ms_orgs")
    .values({
      name: "testing org",
      address: "jakarta",
      description: "very kind org",
      phone: "01234",
    })
    .returning(["id", "name"])
    .executeTakeFirstOrThrow();

  const orig_password = "secret password";
  const user_ids = await app.db
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

  await app.db
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

  const project = await app.db
    .insertInto("ms_projects")
    .values({
      description: "very awesome project",
      name: "testing project",
      org_id: org.id,
    })
    .returning(["id", "name"])
    .executeTakeFirstOrThrow();

  await app.db
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

  const bucket = await app.db
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

  const task = await app.db
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

  const chat = await app.db
    .insertInto("ms_chatrooms")
    .values({
      name: "Chatroom Base Case",
    })
    .returning(["ms_chatrooms.id", "ms_chatrooms.name"])
    .executeTakeFirstOrThrow();

  await app.db
    .insertInto("chatrooms_users")
    .values({
      chatroom_id: chat.id,
      user_id: chat_user.id,
    })
    .execute();

  const message = await app.db
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

  await app.db
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

  const org_categories = await app.db
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

  const project_categories = await app.db
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
  };
}

export async function getLoginCookie(username: string, password: string) {
  const login = await new APIContext("SessionPut").fetch(`/api/session`, {
    method: "PUT",
    body: {
      user_name: username,
      user_password: password,
    },
  });

  // PENTING: Header sampai duluan sebelum body, jadi sebenarnya requestnya belum selesai.
  // Bisa jadi race condition kalau session belum di persist ke DB tapi kita udah ngirim session ID baru.
  // Makanya kita tunggu sampai requestnya beneran selesai baru lanjut.
  await login.json();

  const cookie_pre = login.headers.getSetCookie();
  const cookie = cookie_pre.map((x) => x.split(";")[0]).join("; ");

  return cookie;
}
