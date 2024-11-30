import { Skeleton } from "@mui/material";
import { ReactNode } from "react";
import { Redirect, useParams } from "wouter";
import { APIError } from "../../helpers/fetch.ts";
import { useSessionGet } from "../../queries/sesssion_hooks.ts";
import { useUsersDetailGet } from "../../queries/user_hooks.ts";

const EXIT_STATUS_CODES = [401, 403, 404];

function CheckUser(props: { children: ReactNode; self?: boolean; user_id: number }) {
  const { children, self, user_id } = props;
  const { data: user, isError } = useUsersDetailGet({
    user_id,
    retry: (failureCount, error) => {
      if (failureCount > 3) {
        return false;
      }

      if (!(error instanceof APIError)) {
        return true;
      }

      if (EXIT_STATUS_CODES.includes(error.status)) {
        return false;
      }
      return true;
    },
  });
  const { data: session } = useSessionGet();

  if (isError) {
    return <Redirect to="/" />;
  }

  if (user == undefined) {
    return <Skeleton />;
  }

  if (!self) {
    return children;
  }

  if (!session?.logged || session.user_id !== user_id) {
    return <Redirect to="/" />;
  }

  return children;
}

function AuthorizeUser(props: { children: ReactNode; self?: boolean }) {
  const { id } = useParams();
  const user_id = Number(id);
  if (Number.isNaN(user_id)) {
    return <Redirect to="/" />;
  }
  return <CheckUser {...props} user_id={user_id} />;
}

export default AuthorizeUser;
