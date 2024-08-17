import { useMutation, useQuery } from "@tanstack/react-query";
import { APIContext } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";

const sessionKeys = {
  session: () => ["session"] as const,
};

export function useSessionGet() {
  return useQuery({
    queryKey: sessionKeys.session(),
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
      queryClient.invalidateQueries({ queryKey: sessionKeys.session() });
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
      queryClient.invalidateQueries({ queryKey: sessionKeys.session() });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}
