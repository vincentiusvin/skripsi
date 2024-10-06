import { Skeleton } from "@mui/material";
import { ReactNode } from "react";
import { Redirect, useParams } from "wouter";
import { APIError } from "../../../helpers/fetch.ts";
import { useReportsDetailGet } from "../../../queries/report_hooks.ts";
import { useSessionGet } from "../../../queries/sesssion_hooks.ts";

export function RedirectBack() {
  return <Redirect to="/reports" />;
}

/**
 * Cek projek ini beneran ada atau nggak.
 */
function CheckReport(props: { children: ReactNode; report_id: number }) {
  const { children, report_id } = props;

  const { data: session } = useSessionGet();
  const { data: project, isError } = useReportsDetailGet({
    report_id,
    retry: (failureCount, error) => {
      if (
        (error instanceof APIError && (error.status === 404 || error.status === 401)) ||
        failureCount > 3
      ) {
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

  if (!session.logged) {
    return <RedirectBack />;
  }

  return children;
}

function AuthorizeReports(props: { children: ReactNode }) {
  const { report_id: id } = useParams();
  const report_id = Number(id);
  if (isNaN(report_id)) {
    return <RedirectBack />;
  }

  return <CheckReport report_id={report_id} {...props} />;
}

export default AuthorizeReports;
