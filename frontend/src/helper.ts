import { stringify } from "qs";
import { API } from "../../backend/src/exports";

type APIError = Error & {
  info: { msg: string };
  status: number;
};

/**
 * Class yang dipakai cuma buat inject typing ke fungsi.
 * Cara pakainya dengan:
 *
 * `new APIContext("key_dari_backend").fetch(url, string)`
 */
export class APIContext<T extends keyof API> {
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
    }
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

    if (!res.ok) {
      const error = new Error(
        "An error occurred while fetching the data."
      ) as APIError;
      error.info = await res.json();
      error.status = res.status;
      throw error;
    }

    return res.json();
  }

  arrayFetch(arr: Parameters<this["fetch"]>) {
    return this.fetch(arr[0], arr[1]);
  }
}
