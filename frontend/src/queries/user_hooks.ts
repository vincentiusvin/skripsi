import { useMutation, useQuery } from "@tanstack/react-query";
import { APIContext } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";

export function useUsersPost(username: string, password: string, onSuccess?: () => void) {
  return useMutation({
    mutationFn: () =>
      new APIContext("UsersPost").fetch("/api/users", {
        body: {
          user_name: username,
          user_password: password,
        },
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
