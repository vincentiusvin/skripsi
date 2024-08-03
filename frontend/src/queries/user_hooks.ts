import { useMutation, useQuery } from "@tanstack/react-query";
import { API } from "../../../backend/src/routes";
import { APIContext } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";

export function useUsersPost(opts?: { onSuccess?: () => void }) {
  const { onSuccess } = opts ?? {};
  return useMutation({
    mutationFn: new APIContext("UsersPost").bodyFetch("/api/users", {
      method: "POST",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useUsersGet() {
  return useQuery({
    queryKey: ["users", "collection"],
    queryFn: () => new APIContext("UsersGet").fetch("/api/users"),
  });
}

export function useUserAccountDetailGet(opts: {
  user_id: number;
  retry?: (failurecount: number, error: any) => boolean;
}) {
  const { user_id, retry } = opts;
  return useQuery({
    queryKey: ["users", "detail", user_id],
    queryFn: () => new APIContext("UserAccountGet").fetch(`/api/user/account/${user_id}`),
    retry: retry,
  });
}

export function useUserAccountDetailUpdate(opts: {
  user_id: number;
  onSuccess?: (data: API["UserAccountUpdate"]["ResBody"]) => void;
}) {
  const { user_id, onSuccess } = opts;
  return useMutation({
    mutationFn: new APIContext("UserAccountUpdate").bodyFetch(`/api/user/account/${user_id}`, {
      method: "PUT",
    }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      if (onSuccess) {
        onSuccess(data);
      }
    },
  });
}
