const project_roles = ["Pending", "Dev", "Admin", "Not Involved"] as const;
export type ProjectRoles = (typeof project_roles)[number];

export function parseRole(role: string) {
  return project_roles.find((x) => x === role);
}
