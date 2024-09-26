import { Skeleton } from "@mui/material";
import { ReactNode } from "react";
import { Redirect, useParams } from "wouter";
import { OrgRoles } from "../../../../../backend/src/modules/organization/OrgMisc.ts";
import { APIError } from "../../../helpers/fetch.ts";
import { useOrgDetailGet, useOrgsDetailMembersGet } from "../../../queries/org_hooks.ts";
import { useSessionGet } from "../../../queries/sesssion_hooks.ts";

export function RedirectBack() {
  return <Redirect to="/orgs" />;
}

/**
 * Cek rolenya valid atau nggak.
 */
function CheckRole(props: {
  children: ReactNode;
  allowedRoles: OrgRoles[];
  user_id: number;
  org_id: number;
}) {
  const { org_id, user_id, allowedRoles, children } = props;
  const { data: role } = useOrgsDetailMembersGet({
    org_id,
    user_id,
  });
  if (role == undefined) {
    return <Skeleton />;
  }
  if (allowedRoles.includes(role.role)) {
    return children;
  } else {
    return <RedirectBack />;
  }
}

/**
 * Cek projek ini beneran ada atau nggak.
 */
function CheckOrgs(props: { children: ReactNode; allowedRoles: OrgRoles[]; org_id: number }) {
  const { children, allowedRoles, org_id } = props;
  const isPublic = !!allowedRoles.find((x) => x === "Not Involved");

  const { data: session } = useSessionGet();
  const { data: project, isError } = useOrgDetailGet({
    id: org_id,
    retry: (failureCount, error) => {
      if ((error instanceof APIError && error.status === 404) || failureCount > 3) {
        return false;
      }
      return true;
    },
  });
  if (isError) {
    return <RedirectBack />;
  }

  if (!project || !session) {
    return <Skeleton />;
  }

  if (isPublic) {
    return children;
  }

  if (!session.logged) {
    return <RedirectBack />;
  }

  return <CheckRole user_id={session.user_id} {...props} />;
}

/**
 * Cek user boleh buka projek ini atau nggak.
 */
function AuthorizeOrgs(props: { children: ReactNode; allowedRoles: OrgRoles[] }) {
  const { org_id: id } = useParams();
  const org_id = Number(id);
  if (isNaN(org_id)) {
    return <RedirectBack />;
  }

  return <CheckOrgs org_id={org_id} {...props} />;
}

export default AuthorizeOrgs;
