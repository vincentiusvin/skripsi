import _ from "lodash";
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

export function getNotifications(user_id: number, cookie: string) {
  return new APIContext("NotificationsGet").fetch(`/api/notifications`, {
    headers: {
      cookie: cookie,
    },
    query: {
      user_id: user_id.toString(),
    },
    credentials: "include",
    method: "get",
  });
}

export class NotificationTester {
  private cookie: string;
  private user_id: number;
  private before?: {
    created_at: Date;
    description: string;
    id: number;
    user_id: number;
    type: "OrgManage" | "ProjectManage" | "ProjectTask" | "ProjectChat" | "GeneralChat";
    read: boolean;
    title: string;
    type_id: number | null;
  }[];
  private after?: {
    created_at: Date;
    description: string;
    id: number;
    user_id: number;
    type: "OrgManage" | "ProjectManage" | "ProjectTask" | "ProjectChat" | "GeneralChat";
    read: boolean;
    title: string;
    type_id: number | null;
  }[];

  private constructor(user_id: number, cookie: string) {
    this.user_id = user_id;
    this.cookie = cookie;
  }

  static async fromLoginInfo(user_id: number, username: string, password: string) {
    const cookie = await getLoginCookie(username, password);
    return new NotificationTester(user_id, cookie);
  }

  static fromCookie(user_id: number, cookie: string) {
    return new NotificationTester(user_id, cookie);
  }

  getBefore() {
    if (this.before == undefined) {
      throw new Error("Notification tester not started! Please call start()");
    }
    return this.before;
  }

  getAfter() {
    if (this.after == undefined) {
      throw new Error("Notification tester not finished! Please call finish()");
    }
    return this.after;
  }

  diff() {
    const before = this.getBefore();
    const after = this.getAfter();
    return _.differenceWith(after, before, _.isEqual);
  }

  async start() {
    const req = await getNotifications(this.user_id, this.cookie);
    const result = await req.json();
    this.before = result;
  }

  async finish() {
    const req = await getNotifications(this.user_id, this.cookie);
    const result = await req.json();
    this.after = result;
  }
}
