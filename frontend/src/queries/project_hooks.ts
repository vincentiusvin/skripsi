import { useQuery } from "@tanstack/react-query";
import { APIContext } from "../helpers/fetch";

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
