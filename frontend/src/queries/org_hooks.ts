import { useMutation, useQuery } from "@tanstack/react-query";
import { APIContext } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";

export function useOrgDetailGet(opts: {
  id: number;
  retry?: (failureCount: number, error: Error) => boolean;
  enabled?: boolean;
}) {
  const { id, retry, enabled } = opts;
  return useQuery({
    queryKey: ["orgs", "detail", id],
    queryFn: () => new APIContext("OrgsDetailGet").fetch(`/api/orgs/${id}`),
    retry: retry,
    enabled: enabled,
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

export function useOrgsUpdate(opts: {
  id: number;
  name: string;
  desc: string;
  address: string;
  phone: string;
  categories: number[];
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
      queryClient.invalidateQueries({ queryKey: ["orgs"] });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useOrgsDelete(opts: { id: number; onSuccess?: () => void }) {
  const { id, onSuccess } = opts;
  return useMutation({
    mutationFn: () =>
      new APIContext("OrgsDelete").fetch(`/api/orgs/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgs"] });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}
