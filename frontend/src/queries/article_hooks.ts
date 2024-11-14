import { useMutation, useQuery } from "@tanstack/react-query";
import { APIContext } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";

const articleKeys = {
  all: () => ["articles"] as const,
  lists: () => [...articleKeys.all(), "list"] as const,
  list: (param: unknown) => [...articleKeys.lists(), param] as const,
  details: () => [...articleKeys.all(), "detail"] as const,
  detail: (article_id: number) => [...articleKeys.details(), article_id] as const,
};

export function useArticlesGet(opts?: { user_id?: number }) {
  const { user_id } = opts || {};

  return useQuery({
    queryKey: articleKeys.list(opts),
    queryFn: () =>
      new APIContext("ArticlesGet").fetch("/api/articles", {
        query: {
          ...(user_id && { user_id: user_id.toString() }),
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
    queryKey: articleKeys.detail(article_id), // Cache key based on contribution ID
    queryFn: () => new APIContext("ArticlesDetailGet").fetch(`/api/articles/${article_id}`), // Fetch contribution detail by ID
    retry, // Retry logic
  });
}

export function useArticlesGetLikesId(opts: {
  article_id: number;
  retry?: (failureCount: number, error: unknown) => boolean;
}) {
  const { article_id, retry } = opts;

  return useQuery({
    queryKey: articleKeys.detail(article_id), // Cache key based on contribution ID
    queryFn: () => new APIContext("ArticleGetLikesId").fetch(`/api/articles/${article_id}/upvotes`), // Fetch contribution detail by ID
    retry, // Retry logic
  });
}

export function useArticlesDetailCommentGet(opts: {
  article_id: number;
  retry?: (failureCount: number, error: unknown) => boolean;
}) {
  const { article_id, retry } = opts;

  return useQuery({
    queryKey: articleKeys.detail(article_id), // Cache key based on contribution ID
    queryFn: () =>
      new APIContext("ArticlesDetailCommentsGet").fetch(`/api/articles/${article_id}/comments`), // Fetch contribution detail by ID
    retry, // Retry logic
  });
}
export function useArticlesPost(opts: { onSuccess?: () => void }) {
  const { onSuccess } = opts;
  return useMutation({
    mutationFn: new APIContext("ArticlesPost").bodyFetch("/api/contributions", {
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
export function useArticlesUpvoteAdd(opts: { onSuccess?: () => void }) {
  const { onSuccess } = opts;
  return useMutation({
    mutationFn: new APIContext("UpvoteAdd").bodyFetch("/api/articles/upvote", {
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

export function useArticlesUpvoteDelete(opts: { article_id: number, user_id: number; onSuccess?: () => void }) {
  const { onSuccess, article_id } = opts;
  return useMutation({
    mutationFn: () =>
      new APIContext("UpvoteDelete").fetch(`/api/articles/upvotes`, {
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
