import { useMutation, useQuery } from "@tanstack/react-query";
import { APIContext } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";

const articleKeys = {
  all: () => ["articles"] as const,
  lists: () => [...articleKeys.all(), "list"] as const,
  list: (param: unknown) => [...articleKeys.lists(), param] as const,
  details: () => [...articleKeys.all(), "detail"] as const,
  detail: (article_id: number) => [...articleKeys.details(), article_id] as const,
  comments: (article_id: number) => [...articleKeys.detail(article_id), "comment"] as const,
  likes: (article_id: number) => [...articleKeys.detail(article_id), "like"] as const,
  like: (article_id: number, user_id: number) =>
    [...articleKeys.likes(article_id), user_id] as const,
};

export function useArticlesGet(opts?: {
  limit?: number;
  page?: number;
  user_id?: number;
  keyword?: string;
}) {
  const { keyword, limit, page } = opts ?? {};
  return useQuery({
    queryKey: articleKeys.list(opts),
    queryFn: () =>
      new APIContext("ArticlesGet").fetch("/api/articles", {
        query: {
          keyword: keyword != undefined && keyword.length !== 0 ? keyword : undefined,
          limit: limit != undefined && !Number.isNaN(limit) ? limit.toString() : undefined,
          page: page != undefined && !Number.isNaN(page) ? page.toString() : undefined,
        },
      }),
  });
}

export function useArticlesDetailGet(opts: {
  article_id: number;
  retry?: (failureCount: number, error: unknown) => boolean;
}) {
  const { article_id, retry } = opts;

  return useQuery({
    queryKey: articleKeys.detail(article_id),
    queryFn: () => new APIContext("ArticlesDetailGet").fetch(`/api/articles/${article_id}`),
    retry,
  });
}

export function useArticlesPost(opts: { onSuccess?: () => void }) {
  const { onSuccess } = opts;
  return useMutation({
    mutationFn: new APIContext("ArticlesPost").bodyFetch("/api/articles", {
      method: "POST",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useArticlesDetailPut(opts: { article_id: number; onSuccess?: () => void }) {
  const { article_id, onSuccess } = opts;
  return useMutation({
    mutationFn: new APIContext("ArticlesDetailPut").bodyFetch(`/api/articles/${article_id}`, {
      method: "PUT",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.all() });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useArticlesDetailDelete(opts: { article_id: number; onSuccess?: () => void }) {
  const { onSuccess, article_id } = opts;
  return useMutation({
    mutationFn: () =>
      new APIContext("ArticlesDetailDelete").fetch(`/api/articles/${article_id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.all() });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useArticlesLikesGet(opts: {
  article_id: number;
  retry?: (failureCount: number, error: unknown) => boolean;
}) {
  const { article_id, retry } = opts;

  return useQuery({
    queryKey: articleKeys.likes(article_id),
    queryFn: () =>
      new APIContext("ArticlesDetailLikesGet").fetch(`/api/articles/${article_id}/likes`),
    retry,
  });
}

export function useArticleLikeStatusGet(opts: { article_id: number; user_id: number }) {
  const { article_id, user_id } = opts;

  return useQuery({
    queryKey: articleKeys.like(article_id, user_id),
    queryFn: () =>
      new APIContext("ArticlesDetailLikesDetailGet").fetch(
        `/api/articles/${article_id}/likes/${user_id}`,
      ),
  });
}

export function useArticleLike(opts: {
  article_id: number;
  user_id: number;
  onSuccess?: () => void;
}) {
  const { onSuccess, article_id, user_id } = opts;
  return useMutation({
    mutationFn: () =>
      new APIContext("ArticlesDetailLikesDetailPut").fetch(
        `/api/articles/${article_id}/likes/${user_id}`,
        {
          body: {
            like: true,
          },
          method: "PUT",
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.all() });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useArticleUnlike(opts: {
  article_id: number;
  user_id: number;
  onSuccess?: () => void;
}) {
  const { article_id, user_id, onSuccess } = opts;
  return useMutation({
    mutationFn: () =>
      new APIContext("ArticlesDetailLikesDetailDelete").fetch(
        `/api/articles/${article_id}/likes/${user_id}`,
        {
          method: "DELETE",
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.likes(article_id) });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useArticlesDetailCommentsGet(opts: {
  article_id: number;
  retry?: (failureCount: number, error: unknown) => boolean;
}) {
  const { article_id, retry } = opts;

  return useQuery({
    queryKey: articleKeys.comments(article_id),
    queryFn: () =>
      new APIContext("ArticlesDetailCommentsGet").fetch(`/api/articles/${article_id}/comments`),
    retry,
  });
}

export function useArticlesDetailCommentPost(opts: { article_id: number; onSuccess?: () => void }) {
  const { article_id, onSuccess } = opts;
  return useMutation({
    mutationFn: new APIContext("ArticlesDetailCommentsPost").bodyFetch(
      `/api/articles/${article_id}/comments`,
      {
        method: "POST",
      },
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.all() });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}
