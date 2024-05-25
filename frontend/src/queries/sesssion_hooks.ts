import { useMutation, useQuery } from "@tanstack/react-query";
import { APIContext } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: () => new APIContext("GetSession").fetch("/api/session"),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () =>
      new APIContext("DeleteSession").fetch("/api/session", {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
}

export function useLogin(username: string, password: string, onSuccess: () => void) {
  return useMutation({
    mutationFn: () =>
      new APIContext("PutSession").fetch("/api/session", {
        body: {
          user_name: username,
          user_password: password,
        },
        method: "PUT",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      onSuccess();
    },
  });
}
