import { useMutation, useQuery } from "@tanstack/react-query";
import { API } from "../../../backend/src/routes";
import { APIContext } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";

export function useProjectsDetailGet(opts: {
  project_id: number;
  retry?: (failurecount: number, error: unknown) => boolean;
}) {
  const { project_id, retry } = opts;
  return useQuery({
    queryKey: ["projects", "detail", project_id],
    queryFn: () => new APIContext("ProjectsDetailGet").fetch(`/api/projects/${project_id}`),
    retry: retry,
  });
}

export function useProjectsGet(opts?: { org_id?: number; user_id?: number; keyword?: string }) {
  const { org_id, user_id, keyword } = opts || {};

  return useQuery({
    queryKey: ["projects", "collection", opts],
    queryFn: () =>
      new APIContext("ProjectsGet").fetch("/api/projects", {
        query: {
          ...(org_id && { org_id: org_id.toString() }),
          ...(user_id && { user_id: user_id.toString() }),
          ...(keyword && { keyword }),
        },
      }),
  });
}

export function useProjectsDetailMembersGet(opts: {
  project_id: number | undefined;
  user_id: number | undefined;
}) {
  const { project_id, user_id } = opts;
  return useQuery({
    queryKey: ["projects", "detail", project_id, "members", user_id],
    queryFn: () =>
      new APIContext("ProjectsDetailMembersGet").fetch(
        `/api/projects/${project_id}/users/${user_id}`,
      ),
    enabled: project_id !== undefined && user_id !== undefined,
    retry: false,
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

export function useProjectsDetailBucketsGet(opts: { project_id: number }) {
  const { project_id } = opts;
  return useQuery({
    queryKey: ["projects"],
    queryFn: () =>
      new APIContext("ProjectsDetailBucketsGet").fetch(`/api/projects/${project_id}/buckets`),
  });
}

export function useProjectsDetailBucketsPost(opts: { project_id: number; onSuccess: () => void }) {
  const { project_id, onSuccess } = opts;
  return useMutation({
    mutationFn: new APIContext("ProjectsDetailBucketsPost").bodyFetch(
      `/api/projects/${project_id}/buckets`,
      {
        method: "POST",
      },
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}
