const org_roles = ["Invited", "Admin"] as const;
export type OrgRoles = (typeof org_roles)[number] | "Not Involved";

export function parseRole(role: string): Exclude<OrgRoles, "Not Involved"> {
  const ret = org_roles.find((x) => x === role);
  if (ret == undefined) {
    throw new Error(`Terdapat role yang invalid: ${role}`);
  }
  return ret;
}
