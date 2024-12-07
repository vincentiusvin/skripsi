export const article_roles = ["Dev", "Admin"] as const;
export type ArticleRoles = (typeof article_roles)[number] | "Not Involved";

export function parseRole(role: string): Exclude<ArticleRoles, "Not Involved"> {
  const ret = article_roles.find((x) => x === role);
  if (ret == undefined) {
    throw new Error(`Terdapat role yang invalid: ${role}`);
  }
  return ret;
}
