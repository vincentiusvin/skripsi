import { useMutation, useQuery } from "@tanstack/react-query";
import { API } from "../../../backend/src/routes";
import { APIContext } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";

export function useProjectsDetailGet(
  id: string,
  retry?: (failurecount: number, error: any) => boolean,
) {
  return useQuery({
    queryKey: ["projects", "detail", id],
    queryFn: () => new APIContext("ProjectsDetailGet").fetch(`/api/projects/${id}`),
    retry: retry,
  });
}

export function useProjectsGet(org_id?: string) {
  return useQuery({
    queryKey: ["projects", "collection", org_id],
    queryFn: () =>
      new APIContext("ProjectsGet").fetch("/api/projects", {
        query:
          org_id !== undefined
            ? {
                org_id: org_id,
              }
            : undefined,
      }),
  });
}

export function useProjectsDetailMembersGet(
  project_id: number | undefined,
  user_id: number | undefined,
) {
  return useQuery({
    queryKey: ["projects", "detail", project_id, "members", user_id],
    queryFn: () =>
      new APIContext("ProjectsDetailMembersGet").fetch(
        `/api/projects/${project_id}/users/${user_id}`,
      ),
    enabled: project_id !== undefined && user_id !== undefined,
  });
}

export function useProjectsDetailMembersDelete(
  project_id: number | undefined,
  user_id: number | undefined,
  onSuccess?: (data: API["ProjectsDetailMembersDelete"]["ResBody"]) => void,
) {
  return useMutation({
    mutationFn: () => {
      if (project_id === undefined) {
        throw new Error("Projek invalid!");
      }
      if (user_id === undefined) {
        throw new Error("User invalid!");
      }
      return new APIContext("ProjectsDetailMembersPut").fetch(
        `/api/projects/${project_id}/users/${user_id}`,
        {
          method: "DELETE",
        },
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      if (onSuccess) {
        onSuccess(data);
      }
    },
  });
}

export function useProjectsDetailMembersPut(
  project_id: number | undefined,
  user_id: number | undefined,
  onSuccess?: (data: API["ProjectsDetailMembersPut"]["ResBody"]) => void,
) {
  return useMutation({
    mutationFn: () => {
      if (project_id === undefined) {
        throw new Error("Projek invalid!");
      }
      if (user_id === undefined) {
        throw new Error("User invalid!");
      }
      return new APIContext("ProjectsDetailMembersPut").fetch(
        `/api/projects/${project_id}/users/${user_id}`,
        {
          method: "PUT",
        },
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      if (onSuccess) {
        onSuccess(data);
      }
    },
  });
}

export function useProjectsPost(opts: {
  name: string;
  desc: string;
  org_id: number;
  category: number;
  onSuccess?: () => void;
}) {
  const { name, desc, org_id, category, onSuccess } = opts;
  return useMutation({
    mutationFn: () =>
      new APIContext("ProjectsPost").fetch("/api/projects", {
        method: "POST",
        body: {
          category_id: category,
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

export function useProjectsCategoriesGet() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => new APIContext("ProjectsCategoriesGet").fetch(`/api/project-categories`),
  });
}
