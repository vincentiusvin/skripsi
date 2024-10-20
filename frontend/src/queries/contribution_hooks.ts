import { useMutation, useQuery } from "@tanstack/react-query";
import { APIContext } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";

const contributionKeys = {
  all: () => ["contributions"] as const,
  lists: () => [...contributionKeys.all(), "list"] as const,
  list: (param: unknown) => [...contributionKeys.lists(), param] as const,
  details: () => [...contributionKeys.all(), "detail"] as const,
  detail: (contribution_id: number) => [...contributionKeys.details(), contribution_id] as const,
};

export function useContributionsGet(opts?: { user_id?: number; project_id?: number }) {
  const { user_id, project_id } = opts || {};

  return useQuery({
    queryKey: contributionKeys.list(opts),
    queryFn: () =>
      new APIContext("ContributionsGet").fetch("/api/contributions", {
        query: {
          ...(user_id && { user_id: user_id.toString() }),
          ...(project_id && { project_id: project_id.toString() }),
        },
      }),
  });
}

export function useContributionsDetailGet(opts: {
  contribution_id: number;
  retry?: (failureCount: number, error: unknown) => boolean;
}){
  const { contribution_id, retry } = opts;

  return useQuery({
    queryKey: contributionKeys.detail(contribution_id), // Cache key based on contribution ID
    queryFn: () =>
      new APIContext("ContributionsDetailGet").fetch(`/api/contributions/${contribution_id}`), // Fetch contribution detail by ID
    retry, // Retry logic
  });
}

export function useContributionsPost(opts: { onSuccess?: () => void }) {
  const { onSuccess } = opts;
  return useMutation({
    mutationFn: new APIContext("ContributionsPost").bodyFetch("/api/contributions", {
      method: "POST",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contributionKeys.lists() });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useContributionsDetailPut(opts: {
  contribution_id: number;
  onSuccess?: () => void;
}) {
  const { contribution_id, onSuccess } = opts;
  return useMutation({
    mutationFn: new APIContext("ContributionsDetailPut").bodyFetch(
      `/api/contributions/${contribution_id}`,
      {
        method: "PUT",
      },
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contributionKeys.all() });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}
