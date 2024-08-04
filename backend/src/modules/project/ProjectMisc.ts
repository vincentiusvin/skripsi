const project_roles = ["Pending", "Dev", "Admin"] as const;
export type ProjectRoles = (typeof project_roles)[number] | "Not Involved";

export function parseRole(role: string): Exclude<ProjectRoles, "Not Involved"> {
  const ret = project_roles.find((x) => x === role);
  if (ret == undefined) {
    throw new Error(`Terdapat role yang invalid: ${role}`);
  }
  return ret;
}
