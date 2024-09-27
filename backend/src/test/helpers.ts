import { stringify } from "qs";
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
