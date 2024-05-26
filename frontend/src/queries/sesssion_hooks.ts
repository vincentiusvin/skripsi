import { useMutation, useQuery } from "@tanstack/react-query";
import { APIContext } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";

export function useSessionGet() {
  return useQuery({
    queryKey: ["session"],
    queryFn: () => new APIContext("SessionGet").fetch("/api/session"),
  });
}

export function useSessionDelete() {
  return useMutation({
    mutationFn: () =>
      new APIContext("SessionDelete").fetch("/api/session", {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
}

export function useSessionPut(username: string, password: string, onSuccess: () => void) {
  return useMutation({
    mutationFn: () =>
      new APIContext("SessionPut").fetch("/api/session", {
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
