import { Skeleton } from "@mui/material";
import { ReactNode } from "react";
import { Redirect, useParams } from "wouter";
import { APIError } from "../../helpers/fetch.ts";
import { useContributionsDetailGet } from "../../queries/contribution_hooks.ts";

function RedirectBack() {
  return <Redirect to="/" />;
}

const EXIT_STATUS_CODES = [401, 403, 404];

function CheckContrib(props: { children: ReactNode; contribution_id: number }) {
  const { contribution_id, children } = props;
  const { data: contrib, isError } = useContributionsDetailGet({
    contribution_id,
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

  if (isError) {
    return <RedirectBack />;
  }

  if (contrib == undefined) {
    return <Skeleton />;
  }

  return children;
}

function AuthorizeContribution(props: { children: ReactNode }) {
  const { contribution_id: id } = useParams();
  const contribution_id = Number(id);
  if (isNaN(contribution_id)) {
    return <RedirectBack />;
  }
  return <CheckContrib {...props} contribution_id={contribution_id} />;
}

export default AuthorizeContribution;
