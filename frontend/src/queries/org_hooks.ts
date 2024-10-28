import { useMutation, useQuery } from "@tanstack/react-query";
import { API } from "../../../backend/src/routes.ts";
import { APIContext } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";

const orgKeys = {
  all: () => ["orgs"] as const,
  lists: () => [...orgKeys.all(), "list"] as const,
  list: (opts?: { user_id?: number }) => [...orgKeys.all(), "list", opts] as const,
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

export function useOrgsGet(opts?: { user_id?: number }) {
  const { user_id } = opts ?? {};
  return useQuery({
    queryKey: user_id ? orgKeys.list({ user_id }) : orgKeys.list(),
    queryFn: () =>
      new APIContext("OrgsGet").fetch("/api/orgs", {
        query: user_id
          ? {
              user_id: user_id.toString(),
            }
          : undefined,
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

export function useOrgsUpdate(opts: {
  id: number;
  name?: string;
  desc?: string;
  address?: string;
  phone?: string;
  categories?: number[];
  image?: string;
  onSuccess?: () => void;
}) {
  const { id, name, desc, address, phone, image, onSuccess, categories } = opts;
  return useMutation({
    mutationFn: () =>
      new APIContext("OrgsUpdate").fetch(`/api/orgs/${id}`, {
        method: "PUT",
        body: {
          org_name: name,
          org_description: desc,
          org_address: address,
          org_phone: phone,
          org_categories: categories,
          ...(image && { org_image: image }),
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.all() });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useOrgsDetailMembersGet(opts: { org_id: number; user_id: number }) {
  const { org_id, user_id } = opts;
  return useQuery({
    queryKey: orgKeys.detailMembers(org_id, user_id),
    queryFn: () =>
      new APIContext("OrgsDetailMembersDetailGet").fetch(`/api/orgs/${org_id}/users/${user_id}`),
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
