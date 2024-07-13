import { hashSync } from "bcryptjs";
import { stringify } from "qs";
import { Application } from "../src/app.js";
import { API } from "../src/routes.js";

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

    const res = await fetch(`http://localhost:${process.env.APPLICATION_PORT}` + urlWithParams, {
      ...options,
      body: stringBody,
    });

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
    ])
    .returning(["id", "name"])
    .execute();

  await app.db
    .insertInto("orgs_users")
    .values({
      org_id: org.id,
      user_id: user_ids[0].id,
      role: "Admin",
    })
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
    .values({
      name: "Todo",
      bucket_id: bucket[0].id,
      order: 1,
    })
    .returning(["ms_tasks.id", "ms_tasks.name"])
    .executeTakeFirstOrThrow();

  return {
    org,
    project,
    bucket_fill: bucket[0],
    bucket_empty: bucket[1],
    task,
    member: { ...user_ids[0], password: orig_password },
    nonmember: { ...user_ids[1], password: orig_password },
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
