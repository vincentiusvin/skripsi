import { useMutation, useQuery } from "@tanstack/react-query";
import { APIContext } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";

const userKeys = {
  all: () => ["users"] as const,
  lists: () => [...userKeys.all(), "list"] as const,
  list: (opts: { keyword: string | undefined }) => [...userKeys.all(), "list", opts] as const,
  details: () => [...userKeys.all(), "detail"] as const,
  detail: (user_id: number) => [...userKeys.details(), user_id] as const,
};

export function useUsersPost(opts?: { onSuccess?: () => void }) {
  const { onSuccess } = opts ?? {};
  return useMutation({
    mutationFn: new APIContext("UsersPost").bodyFetch("/api/users", {
      method: "POST",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });

      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useUsersGet(opts?: { keyword?: string }) {
  const { keyword } = opts ?? {};
  const clean_keyword = keyword != undefined && keyword.length > 0 ? keyword : undefined;
  return useQuery({
    queryKey: userKeys.list({ keyword: clean_keyword }),
    queryFn: () =>
      new APIContext("UsersGet").fetch("/api/users", {
        query: {
          keyword: clean_keyword,
        },
      }),
  });
}

export function useUsersDetailGet(opts: {
  user_id: number;
  retry?: (failurecount: number, error: unknown) => boolean;
}) {
  const { user_id, retry } = opts;
  return useQuery({
    queryKey: userKeys.detail(user_id),
    queryFn: () => new APIContext("UsersDetailGet").fetch(`/api/users/${user_id}`),
    retry: retry,
  });
}

export function useUsersDetailUpdate(opts: { user_id: number; onSuccess?: () => void }) {
  const { user_id, onSuccess } = opts;
  return useMutation({
    mutationFn: new APIContext("UsersDetailPut").bodyFetch(`/api/users/${user_id}`, {
      method: "PUT",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all() });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}
