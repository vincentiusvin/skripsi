import { stringify } from "qs";
import type { API } from "../../../backend/src/routes";

export class APIError extends Error {
  status: number;
  constructor(msg: string, status: number) {
    super(msg);
    this.status = status;
  }
}

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
  ): Promise<API[T]["ResBody"]> {
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

    const res = await fetch(urlWithParams, {
      ...options,
      body: stringBody,
    });

    const content = await res.json().catch(() => ({ msg: "Unknown error" }));

    if (!res.ok) {
      throw new APIError(content.msg, res.status) as APIError;
    }

    return content;
  }

  curriedFetch(url: string) {
    return (opts: Parameters<typeof this.fetch>[1]) => this.fetch(url, opts);
  }

  bodyFetch(
    url: string,
    opts: Omit<RequestInit, "body"> & {
      query?: API[T]["ReqQuery"];
    },
  ) {
    return (body: API[T]["ReqBody"]) => this.fetch(url, { ...opts, body });
  }

  queryFetch(
    url: string,
    opts: RequestInit & {
      body?: API[T]["ReqBody"];
    },
  ) {
    return (query: API[T]["ReqQuery"]) => this.fetch(url, { ...opts, query });
  }
}
