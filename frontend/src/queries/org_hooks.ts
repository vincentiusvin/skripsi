import { useMutation, useQuery } from "@tanstack/react-query";
import { API } from "../../../backend/src/routes.ts";
import { APIContext } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";

const orgKeys = {
  all: () => ["orgs"] as const,
  lists: () => [...orgKeys.all(), "list"] as const,
  list: (opts?: { user_id?: number; keyword?: string }) =>
    [...orgKeys.all(), "list", opts] as const,
  details: () => [...orgKeys.all(), "detail"] as const,
  detail: (org_id: number) => [...orgKeys.details(), org_id] as const,
  detailMembers: (org_id: number, user_id: number) => [
    ...orgKeys.detail(org_id),
    "members",
    "detail",
    user_id,
  ],
  orgCategories: () => ["org-categories"],
};

export function useOrgDetailGet(opts: {
  id: number;
  retry?: (failureCount: number, error: Error) => boolean;
  enabled?: boolean;
}) {
  const { id, retry, enabled } = opts;
  return useQuery({
    queryKey: orgKeys.detail(id),
    queryFn: () => new APIContext("OrgsDetailGet").fetch(`/api/orgs/${id}`),
    retry: retry,
    enabled: enabled,
  });
}

export function useOrgsGet(opts?: {
  limit?: number;
  page?: number;
  user_id?: number;
  keyword?: string;
}) {
  const { user_id, keyword, limit, page } = opts ?? {};
  return useQuery({
    queryKey: orgKeys.list(opts),
    queryFn: () =>
      new APIContext("OrgsGet").fetch("/api/orgs", {
        query: {
          user_id: user_id?.toString(),
          keyword: keyword != undefined && keyword.length !== 0 ? keyword : undefined,
          limit: limit != undefined && !Number.isNaN(limit) ? limit.toString() : undefined,
          page: page != undefined && !Number.isNaN(page) ? page.toString() : undefined,
        },
      }),
  });
}

export function useOrgsPost(opts: { onSuccess?: () => void }) {
  const { onSuccess } = opts;
  return useMutation({
    mutationFn: new APIContext("OrgsPost").bodyFetch("/api/orgs", {
      method: "POST",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.lists() });
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
    queryKey: orgKeys.orgCategories(),
    queryFn: () => new APIContext("OrgsCategoriesGet").fetch(`/api/org-categories`),
    retry: retry,
  });
}

export function useOrgsUpdate(opts: { org_id: number; onSuccess?: () => void }) {
  const { org_id, onSuccess } = opts;
  return useMutation({
    mutationFn: new APIContext("OrgsUpdate").bodyFetch(`/api/orgs/${org_id}`, {
      method: "PUT",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.all() });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useOrgsDetailMembersGet(opts: {
  enabled?: boolean;
  org_id: number;
  user_id: number;
}) {
  const { enabled, org_id, user_id } = opts;
  return useQuery({
    queryKey: orgKeys.detailMembers(org_id, user_id),
    queryFn: () =>
      new APIContext("OrgsDetailMembersDetailGet").fetch(`/api/orgs/${org_id}/users/${user_id}`),
    enabled,
  });
}

export function useOrgsDetailMembersDelete(opts: {
  org_id: number;
  user_id: number;
  onSuccess?: (data: API["OrgsDetailMembersDetailDelete"]["ResBody"]) => void;
}) {
  const { org_id, user_id, onSuccess } = opts;
  return useMutation({
    mutationFn: () => {
      return new APIContext("OrgsDetailMembersDetailDelete").fetch(
        `/api/orgs/${org_id}/users/${user_id}`,
        {
          method: "DELETE",
        },
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orgKeys.all() });
      if (onSuccess) {
        onSuccess(data);
      }
    },
  });
}

export function useOrgsDetailMembersPut(opts: {
  org_id: number;
  user_id: number;
  onSuccess?: (data: API["OrgsDetailMembersDetailPut"]["ResBody"]) => void;
}) {
  const { org_id, user_id, onSuccess } = opts;
  return useMutation({
    mutationFn: new APIContext("OrgsDetailMembersDetailPut").bodyFetch(
      `/api/orgs/${org_id}/users/${user_id}`,
      {
        method: "PUT",
      },
    ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orgKeys.all() });
      if (onSuccess) {
        onSuccess(data);
      }
    },
  });
}
