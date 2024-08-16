import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { API } from "../../../backend/src/routes.ts";
import { APIContext } from "../helpers/fetch.ts";
import { queryClient } from "../helpers/queryclient.tsx";
import { useProjectsDetailBucketsGet } from "./project_hooks.ts";

export function useFormattedTasks(opts: { project_id: number }) {
  const { project_id } = opts;
  const { data: buckets } = useProjectsDetailBucketsGet({ project_id });

  return useQueries({
    queries:
      buckets?.map((bucket) => {
        return {
          queryKey: ["projects", "detail", "buckets", bucket.id],
          queryFn: () =>
            new APIContext("BucketsDetailTasksGet").fetch(`/api/buckets/${bucket.id}/tasks`),
        };
      }) || [],
    combine: (res) => {
      return {
        data: res.map((x, i) => ({ tasks: x.data, bucket: buckets![i] })),
        isFetching: res.some((x) => x.isFetching),
      };
    },
  });
}

export function useBucketsDetailTasksGet(opts: { bucket_id: number }) {
  const { bucket_id } = opts;
  return useQuery({
    queryKey: ["projects", "detail", "buckets", bucket_id],
    queryFn: () => new APIContext("BucketsDetailTasksGet").fetch(`/api/buckets/${bucket_id}/tasks`),
  });
}

export function useBucketsDetailTasksPost(opts: { onSuccess: () => void }) {
  const { onSuccess } = opts;
  return useMutation({
    mutationFn: (opts: API["BucketsDetailTasksPost"]["ReqBody"] & { bucket_id: number }) => {
      const { bucket_id, ...rest } = opts;
      return new APIContext("BucketsDetailTasksPost").fetch(`/api/buckets/${bucket_id}/tasks`, {
        method: "POST",
        body: rest,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useTasksDetailPut(opts: { onSuccess?: () => void }) {
  const { onSuccess } = opts;
  return useMutation({
    mutationFn: (opts: API["TasksDetailPut"]["ReqBody"] & { task_id: number }) => {
      const { task_id, ...rest } = opts;
      return new APIContext("TasksDetailPut").fetch(`/api/tasks/${task_id}`, {
        method: "PUT",
        body: rest,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "detail", "buckets"] });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useTasksDetailGet(opts: { task_id: number }) {
  const { task_id } = opts;
  return useQuery({
    queryKey: ["task", task_id],
    queryFn: () => new APIContext("TasksDetailGet").fetch(`/api/tasks/${task_id}`),
  });
}

export function useTasksDetailDelete(opts: { onSuccess?: () => void; task_id: number }) {
  const { onSuccess, task_id } = opts;
  return useMutation({
    mutationFn: new APIContext("TasksDetailDelete").bodyFetch(`/api/tasks/${task_id}`, {
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
