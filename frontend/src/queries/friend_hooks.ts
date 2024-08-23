import { useMutation, useQuery } from "@tanstack/react-query";
import { APIContext } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";

const friendKeys = {
  all: () => ["friends"] as const,
  lists: () => [...friendKeys.all(), "list"] as const,
  list: (user_id: number) => [...friendKeys.all(), "list", { user_id }] as const,
  details: () => [...friendKeys.all(), "detail"] as const,
  detail: (user_id: number, with_id: number) =>
    [...friendKeys.details(), { user_id, with_id }] as const,
};

export function useFriendsDetailGet(opts: { user_id: number; with_id: number }) {
  const { user_id, with_id } = opts;
  return useQuery({
    queryKey: friendKeys.detail(user_id, with_id),
    queryFn: () =>
      new APIContext("UsersDetailFriendsDetailGet").fetch(
        `/api/users/${user_id}/friends/${with_id}`,
      ),
  });
}

export function useFriendsGet(opts: { user_id: number }) {
  const { user_id } = opts;
  return useQuery({
    queryKey: friendKeys.list(user_id),
    queryFn: () => new APIContext("UsersDetailFriendsGet").fetch(`/api/users/${user_id}/friends`),
  });
}

export function useFriendsPut(opts: { user_id: number; with_id: number; onSuccess?: () => void }) {
  const { onSuccess, user_id, with_id } = opts;
  return useMutation({
    mutationFn: new APIContext("UsersDetailFriendsDetailPut").bodyFetch(
      `/api/users/${user_id}/friends/${with_id}`,
      {
        method: "PUT",
      },
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendKeys.list(user_id) });
      queryClient.invalidateQueries({ queryKey: friendKeys.detail(user_id, with_id) });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useFriendsDelete(opts: {
  user_id: number;
  with_id: number;
  onSuccess?: () => void;
}) {
  const { onSuccess, user_id, with_id } = opts;
  return useMutation({
    mutationFn: () =>
      new APIContext("UsersDetailFriendsDetailDelete").fetch(
        `/api/users/${user_id}/friends/${with_id}`,
        {
          method: "delete",
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendKeys.list(user_id) });
      queryClient.invalidateQueries({ queryKey: friendKeys.detail(user_id, with_id) });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}
