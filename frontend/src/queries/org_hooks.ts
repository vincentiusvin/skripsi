import { useMutation, useQuery } from "@tanstack/react-query";
import { APIContext } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";

export function useOrgDetailGet(opts: {
  id: string;
  retry?: (failureCount: number, error: Error) => boolean;
}) {
  const { id, retry } = opts;
  return useQuery({
    queryKey: ["orgs", "detail", id],
    queryFn: () => new APIContext("OrgsDetailGet").fetch(`/api/orgs/${id}`),
    retry: retry,
  });
}

export function useOrgsGet() {
  return useQuery({
    queryKey: ["orgs", "collection"],
    queryFn: () => new APIContext("OrgsGet").fetch("/api/orgs"),
  });
}

export function useOrgsPost(opts: { onSuccess?: () => void }) {
  const { onSuccess } = opts;
  return useMutation({
    mutationFn: new APIContext("OrgsPost").bodyFetch("/api/orgs", {
      method: "POST",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgs"] });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useOrgsCategoriesGet(opts: {
  retry?: (failureCount: number, error: Error) => boolean;
}) {
  const { retry } = opts;
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => new APIContext("OrgsCategoriesGet").fetch(`/api/org-categories`),
    retry: retry,
  });
}
