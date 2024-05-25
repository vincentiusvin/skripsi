import { useMutation, useQuery } from "@tanstack/react-query";
import { APIContext } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";

export function useProjectDetail(
  id: string,
  retry?: (failurecount: number, error: any) => boolean,
) {
  return useQuery({
    queryKey: ["projects", "detail", id],
    queryFn: () => new APIContext("getProjectsDetail").fetch(`/api/projects/${id}`),
    retry: retry,
  });
}

export function useProjectCollection() {
  return useQuery({
    queryKey: ["projects", "collection"],
    queryFn: () => new APIContext("getProjects").fetch("/api/projects"),
  });
}

export function useAddProjects(opts: {
  name: string;
  desc: string;
  org_id: number;
  onSuccess?: () => void;
}) {
  const { name, desc, org_id, onSuccess } = opts;
  return useMutation({
    mutationFn: () =>
      new APIContext("addProjects").fetch("/api/projects", {
        method: "POST",
        body: {
          project_name: name,
          project_desc: desc,
          org_id: org_id,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}
