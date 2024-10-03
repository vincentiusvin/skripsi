import { z } from "zod";

export function zodStringReadableAsNumber(message: string) {
  return z
    .string({ message })
    .min(1, { message })
    .refine((arg) => !isNaN(Number(arg)), { message });
}
