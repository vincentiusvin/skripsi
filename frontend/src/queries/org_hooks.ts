import { useMutation, useQuery } from "@tanstack/react-query";
import { APIContext } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";

export function useOrgDetail(id: string, retry?: (failureCount: number, error: Error) => boolean) {
  return useQuery({
    queryKey: ["orgs", "detail", id],
    queryFn: () => new APIContext("GetOrgDetail").fetch(`/api/orgs/${id}`),
    retry: retry,
  });
}

export function useOrgCollection() {
  return useQuery({
    queryKey: ["orgs", "collection"],
    queryFn: () => new APIContext("GetOrgs").fetch("/api/orgs"),
  });
}

export function useAddOrg(opts: {
  name: string;
  desc: string;
  address: string;
  phone: string;
  category: number;
  image?: string;
  onSuccess?: () => void;
}) {
  const { name, desc, address, phone, image, onSuccess } = opts;
  return useMutation({
    mutationFn: () =>
      new APIContext("PostOrgs").fetch("/api/orgs", {
        method: "POST",
        body: {
          org_name: name,
          org_description: desc,
          org_address: address,
          org_phone: phone,
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
