import { z } from "zod";

export function zodStringReadableAsNumber(message: string) {
  return z
    .string({ message })
    .min(1, { message })
    .refine((arg) => !isNaN(Number(arg)), { message });
}

export function zodPagination() {
  const pageMsg = "Halaman tidak valid!";
  const limitMsg = "Limit tidak valid!";

  return {
    page: z.coerce
      .number({ message: pageMsg })
      .min(1, pageMsg)
      .transform((x) => x.toString())
      .optional(),
    limit: z.coerce
      .number({ message: limitMsg })
      .min(1, limitMsg)
      .transform((x) => x.toString())
      .optional(),
  };
}

export function zodStringReadableAsDateTime(message: string) {
  return z.string({ message }).min(1, { message }).datetime({ message });
}
