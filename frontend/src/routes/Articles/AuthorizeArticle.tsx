import { Skeleton } from "@mui/material";
import { ReactNode } from "react";
import { Redirect, useParams } from "wouter";
import { APIError } from "../../helpers/fetch.ts";
import { useArticlesDetailGet } from "../../queries/article_hooks.ts";
import { useSessionGet } from "../../queries/sesssion_hooks.ts";

const EXIT_STATUS_CODES = [401, 403, 404];

function CheckArticles(props: { children: ReactNode; article_id: number; isAuthor?: boolean }) {
  const { isAuthor, children, article_id } = props;
  const { data: article, isError } = useArticlesDetailGet({
    article_id,
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
    return <Redirect to="/articles" />;
  }
  if (article == undefined) {
    return <Skeleton />;
  }
  if (isAuthor) {
    if (session == undefined) {
      return <Skeleton />;
    }
    if (!session.logged) {
      return <Redirect to="/articles" />;
    }
    if (!session.is_admin && session.user_id !== article.user_id) {
      return <Redirect to="/articles" />;
    }
  }
  return children;
}

function AuthorizeArticle(props: { children: ReactNode; isAuthor?: boolean }) {
  const { article_id: id } = useParams();
  const article_id = Number(id);
  if (Number.isNaN(article_id)) {
    return <Redirect to="/articles" />;
  }
  return <CheckArticles {...props} article_id={article_id} />;
}

export default AuthorizeArticle;
