import { useMutation, useQuery } from "@tanstack/react-query";
import { APIContext } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";

export function useOrgDetailGet(
  id: string,
  retry?: (failureCount: number, error: Error) => boolean,
) {
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

export function useOrgsPost(opts: {
  name: string;
  desc: string;
  address: string;
  phone: string;
  category: number;
  image?: string;
  onSuccess?: () => void;
}) {
  const { name, desc, address, phone, image, onSuccess, category } = opts;
  return useMutation({
    mutationFn: () =>
      new APIContext("OrgsPost").fetch("/api/orgs", {
        method: "POST",
        body: {
          org_name: name,
          org_description: desc,
          org_address: address,
          org_phone: phone,
          org_category: category,
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

export function useOrgsCategoriesGet(retry?: (failureCount: number, error: Error) => boolean) {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => new APIContext("OrgsCategoriesGet").fetch(`/api/org-categories`),
    retry: retry,
  });
}
