import { z } from "zod";

export function defaultError(message: string) {
  return {
    errorMap: () => ({ message }),
  };
}

export function zodStringReadableAsNumber(message: string) {
  return z
    .string(defaultError(message))
    .min(1)
    .refine((arg) => !isNaN(Number(arg)));
}

export function zodPagination() {
  const pageMsg = "Halaman tidak valid!";
  const limitMsg = "Limit tidak valid!";

  return {
    page: z.coerce
      .number(defaultError(pageMsg))
      .min(1)
      .transform((x) => x.toString())
      .optional(),
    limit: z.coerce
      .number(defaultError(limitMsg))
      .min(1)
      .transform((x) => x.toString())
      .optional(),
  };
}

export function zodStringReadableAsDateTime(message: string) {
  return z.string(defaultError(message)).min(1).datetime();
}

/**
 * Ganti dengan implementasi dari zod ketika v4 sudah release.
 * https://github.com/colinhacks/zod/pull/3476
 */
const e164Regex = /^\+(?:[0-9]){6,14}[0-9]$/;
export function zodPhoneNumber(message: string) {
  return z.string(defaultError(message)).min(1).regex(e164Regex, message);
}
