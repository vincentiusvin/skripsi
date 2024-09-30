import { Skeleton } from "@mui/material";
import { ReactNode } from "react";
import { Redirect } from "wouter";
import { useSessionGet } from "../../queries/sesssion_hooks.ts";

export function RedirectBack() {
  return <Redirect to="/" />;
}

/**
 * Cek user admin atau bukan.
 */
function AuthorizeAdmin(props: { children: ReactNode }) {
  const { children } = props;
  const { data: session } = useSessionGet();

  if (session == undefined) {
    return <Skeleton />;
  }

  if (!session.logged || !session.is_admin) {
    return <RedirectBack />;
  }

  return children;
}

export default AuthorizeAdmin;
