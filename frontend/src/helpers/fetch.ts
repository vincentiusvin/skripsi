import { stringify } from "qs";
import type { API } from "../../../backend/src/routes";

export class APIError extends Error {
  info: { msg: string };
  status: number;
  constructor(msg: string, info: { msg: string }, status: number) {
    super(msg);
    this.info = info;
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
  constructor(_key: T) {}

  /**
   * Mirip kaya {@link fetch | fetch API (built-in)}, dengan beberapa perbedaan:
   * Ada type inference.
   * Body dan Query diparse secara otomatis.
   * Content-Type default json
   */
  async fetch(
    url: string,
    options?: Omit<RequestInit, "body" | "query"> & {
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
      throw new APIError(
        "An error occurred while fetching the data.",
        content,
        res.status,
      ) as APIError;
    }

    return content;
  }

  arrayFetch(arr: Parameters<this["fetch"]>) {
    return this.fetch(arr[0], arr[1]);
  }

  curriedFetch(url: string) {
    return (opts: Parameters<typeof this.fetch>[1]) => this.fetch(url, opts);
  }
}
