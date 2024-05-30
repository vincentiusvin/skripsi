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

export function useSessionPut(opts?: { onSuccess: () => void }) {
  const { onSuccess } = opts ?? {};
  return useMutation({
    mutationFn: new APIContext("SessionPut").bodyFetch("/api/session", {
      method: "PUT",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}
