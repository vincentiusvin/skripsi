import { RequestHandler } from "express";
import type { API } from "../../backend/src/exports";

type APIError = Error & {
  info: { msg: string };
  status: number;
};

function serializeQuery(query: Record<string, unknown>) {
  function split([key, value]: [string, unknown]): [string, string][] {
    if (value == null) {
      return [];
    }
    if (Array.isArray(value)) {
      return value.map<[string, string]>((x) => [key, x.toString()]);
    } else {
      return [[key, value.toString()]];
    }
  }
  return new URLSearchParams(
    Object.entries(query).flatMap<[string, string]>(split)
  );
}

export async function apiFetch<T extends keyof API>(
  url: string,
  options: {
    query?: API[T] extends RequestHandler<
      never,
      unknown,
      never,
      infer ReqQuery,
      never
    >
      ? ReqQuery
      : undefined;
    body?: API[T] extends RequestHandler<
      never,
      unknown,
      infer ReqBody,
      never,
      never
    >
      ? ReqBody
      : undefined;
  }
): Promise<
  API[T] extends RequestHandler<never, infer ResBody, never, never, never>
    ? ResBody
    : never
> {
  const { query, body } = options;
  const urlWithParams = query ? url + "?" + serializeQuery(query) : url;
  const stringBody = body ? JSON.stringify(body) : null;

  const res = await fetch(urlWithParams, {
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
