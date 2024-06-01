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
  const org_id = await app.db
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
      org_id: org_id.id,
      user_id: user_ids[0].id,
      role: "Admin",
    })
    .execute();

  const project_id = await app.db
    .insertInto("ms_projects")
    .values({
      description: "very awesome project",
      name: "testing project",
      org_id: org_id.id,
    })
    .returning(["id", "name"])
    .executeTakeFirstOrThrow();

  return {
    org: org_id,
    project: project_id,
    member: { ...user_ids[0], password: orig_password },
    nonmember: { ...user_ids[1], password: orig_password },
  };
}

export async function login(app: Application, as: "member" | "nonmember") {
  const res = await baseCase(app);

  const selected = as === "member" ? res.member : res.nonmember;

  const login = await new APIContext("SessionPut").fetch(`/api/session`, {
    method: "PUT",
    body: {
      user_name: selected.name,
      user_password: selected.password,
    },
  });

  // PENTING: Header sampai duluan sebelum body, jadi sebenarnya requestnya belum selesai.
  // Bisa jadi race condition kalau session belum di persist ke DB tapi kita udah ngirim session ID baru.
  // Makanya kita tunggu sampai requestnya beneran selesai baru lanjut.
  await login.json();

  const cookie_pre = login.headers.getSetCookie();
  const cookie = cookie_pre.map((x) => x.split(";")[0]).join("; ");

  return {
    ...res,
    cookie,
  };
}
