import { useMutation, useQuery } from "@tanstack/react-query";
import { API } from "../../../backend/src/routes";
import { APIContext } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";

const projectKeys = {
  all: () => ["projects"] as const,
  lists: () => [...projectKeys.all(), "list"] as const,
  list: (param: unknown) => [...projectKeys.lists(), param] as const,
  details: () => [...projectKeys.all(), "detail"] as const,
  detail: (project_id: number) => [...projectKeys.details(), project_id] as const,
  detailMembers: (project_id: number, user_id: number) => [
    ...projectKeys.detail(project_id),
    "members",
    "detail",
    user_id,
  ],
  detailEvents: (project_id: number) => [...projectKeys.detail(project_id), "events"],
  projectCategories: () => ["project-categories"],
};

export function useProjectsDetailGet(opts: {
  project_id: number;
  enabled?: boolean;
  retry?: (failurecount: number, error: unknown) => boolean;
}) {
  const { enabled, project_id, retry } = opts;
  return useQuery({
    enabled,
    queryKey: projectKeys.detail(project_id),
    queryFn: () => new APIContext("ProjectsDetailGet").fetch(`/api/projects/${project_id}`),
    retry: retry,
  });
}

export function useProjectsGet(opts?: {
  limit?: number;
  page?: number;
  org_id?: number;
  user_id?: number;
  keyword?: string;
}) {
  const { org_id, user_id, keyword, limit, page } = opts || {};

  return useQuery({
    queryKey: projectKeys.list(opts),
    queryFn: () =>
      new APIContext("ProjectsGet").fetch("/api/projects", {
        query: {
          keyword: keyword,
          org_id: org_id != undefined ? org_id.toString() : undefined,
          user_id: user_id != undefined ? user_id.toString() : undefined,
          limit: limit != undefined ? limit.toString() : undefined,
          page: page != undefined ? page.toString() : undefined,
        },
      }),
  });
}

export function useProjectsDetailMembersGet(opts: {
  project_id: number;
  user_id: number;
  enabled?: boolean;
  retry?: (failurecount: number, error: unknown) => boolean;
}) {
  const { retry, project_id, user_id, enabled } = opts;
  return useQuery({
    queryKey: projectKeys.detailMembers(project_id, user_id),
    queryFn: () =>
      new APIContext("ProjectsDetailMembersGet").fetch(
        `/api/projects/${project_id}/users/${user_id}`,
      ),
    enabled,
    retry,
    meta: {
      skip_error: true,
    },
  });
}

export function useProjectsDetailMembersDelete(opts: {
  project_id: number;
  user_id?: number;
  onSuccess?: (data: API["ProjectsDetailMembersDelete"]["ResBody"]) => void;
}) {
  const { project_id, user_id, onSuccess } = opts;
  return useMutation({
    mutationFn: () => {
      if (user_id === undefined) {
        throw new Error("Data user tidak ditemukan");
      }
      return new APIContext("ProjectsDetailMembersDelete").fetch(
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

export function useProjectsDetailMembersPut(opts: {
  project_id: number | undefined;
  user_id: number | undefined;
  onSuccess?: (data: API["ProjectsDetailMembersPut"]["ResBody"]) => void;
}) {
  const { project_id, user_id, onSuccess } = opts;
  return useMutation({
    mutationFn: new APIContext("ProjectsDetailMembersPut").bodyFetch(
      `/api/projects/${project_id}/users/${user_id}`,
      {
        method: "PUT",
      },
    ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      if (onSuccess) {
        onSuccess(data);
      }
    },
  });
}

export function useProjectsPost(opts: { onSuccess?: () => void }) {
  const { onSuccess } = opts;
  return useMutation({
    mutationFn: new APIContext("ProjectsPost").bodyFetch("/api/projects", {
      method: "POST",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useProjectsDetailPut(opts: { project_id: number; onSuccess?: () => void }) {
  const { onSuccess, project_id } = opts;
  return useMutation({
    mutationFn: new APIContext("ProjectsDetailPut").bodyFetch(`/api/projects/${project_id}`, {
      method: "PUT",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all() });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useProjectsDetailDelete(opts: { project_id: number; onSuccess?: () => void }) {
  const { onSuccess, project_id } = opts;
  return useMutation({
    mutationFn: () =>
      new APIContext("ProjectsDetailDelete").fetch(`/api/projects/${project_id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all() });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useProjectsCategoriesGet() {
  return useQuery({
    queryKey: projectKeys.projectCategories(),
    queryFn: () => new APIContext("ProjectsCategoriesGet").fetch(`/api/project-categories`),
  });
}

export function useProjectsDetailEventsGet(opts: { project_id: number }) {
  const { project_id } = opts;
  return useQuery({
    queryKey: projectKeys.detailEvents(project_id),
    queryFn: () =>
      new APIContext("ProjectsDetailEventsGet").fetch(`/api/projects/${project_id}/events`),
  });
}
