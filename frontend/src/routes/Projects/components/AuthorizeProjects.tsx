import { Skeleton } from "@mui/material";
import { ReactNode } from "react";
import { Redirect, useParams } from "wouter";
import { ProjectRoles } from "../../../../../backend/src/modules/project/ProjectMisc.ts";
import { APIError } from "../../../helpers/fetch.ts";
import {
  useProjectsDetailGet,
  useProjectsDetailMembersGet,
} from "../../../queries/project_hooks.ts";
import { useSessionGet } from "../../../queries/sesssion_hooks.ts";

export function RedirectBack() {
  return <Redirect to="/projects" />;
}

/**
 * Cek rolenya valid atau nggak.
 */
function CheckRole(props: {
  children: ReactNode;
  allowedRoles: ProjectRoles[];
  user_id: number;
  project_id: number;
}) {
  const { project_id, user_id, allowedRoles, children } = props;
  const { data: role } = useProjectsDetailMembersGet({
    project_id,
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
function CheckProject(props: {
  children: ReactNode;
  allowedRoles: ProjectRoles[];
  project_id: number;
}) {
  const { children, allowedRoles, project_id } = props;
  const isPublic = !!allowedRoles.find((x) => x === "Not Involved");

  const { data: session } = useSessionGet();
  const { data: project, isError } = useProjectsDetailGet({
    project_id,
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
function AuthorizeProjects(props: { children: ReactNode; allowedRoles: ProjectRoles[] }) {
  const { project_id: id } = useParams();
  const project_id = Number(id);
  if (isNaN(project_id)) {
    return <RedirectBack />;
  }

  return <CheckProject project_id={project_id} {...props} />;
}

export default AuthorizeProjects;
