import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { API } from "../../../backend/src/routes.ts";
import { APIContext } from "../helpers/fetch.ts";
import { queryClient } from "../helpers/queryclient.tsx";
import { useProjectsDetailGet } from "./project_hooks.ts";

const bucketKeys = {
  all: () => ["buckets"] as const,
  lists: () => [...bucketKeys.all(), "list"] as const,
  list: (project_id: number) => [...bucketKeys.lists(), { project_id }] as const,
  details: () => [...bucketKeys.all(), "detail"] as const,
  detail: (bucket_id: number) => [...bucketKeys.details(), bucket_id] as const,
};

const taskKeys = {
  all: () => ["tasks"] as const,
  lists: () => [...taskKeys.all(), "list"] as const,
  list: (opts: { bucket_id?: number }) => [...taskKeys.lists(), opts] as const,
  details: () => [...taskKeys.all(), "detail"] as const,
  detail: (task_id: number) => [...taskKeys.details(), task_id] as const,
};

export function useTasksGet(opts: { bucket_id?: number; user_id?: number }) {
  const { bucket_id, user_id } = opts;
  return useQuery({
    queryKey: taskKeys.list({ bucket_id }),
    queryFn: () =>
      new APIContext("TasksGet").fetch(`/api/tasks`, {
        query: {
          bucket_id: bucket_id?.toString(),
          user_id: user_id?.toString(),
        },
      }),
  });
}

export function useTasksDetailGet(opts: { task_id: number }) {
  const { task_id } = opts;
  return useQuery({
    queryKey: taskKeys.detail(task_id),
    queryFn: () => new APIContext("TasksDetailGet").fetch(`/api/tasks/${task_id}`),
  });
}

export function useBucketsGet(opts: { project_id: number }) {
  const { project_id } = opts;
  return useQuery({
    queryKey: bucketKeys.list(project_id),
    queryFn: () =>
      new APIContext("BucketsGet").fetch(`/api/buckets`, {
        query: {
          project_id: project_id?.toString(),
        },
      }),
  });
}

export function useFormattedTasks(opts: { project_id: number }) {
  const { project_id } = opts;
  const { data: buckets } = useBucketsGet({ project_id });

  return useQueries({
    queries:
      buckets?.map((bucket) => {
        return {
          queryKey: taskKeys.list({ bucket_id: bucket.id }),
          queryFn: () =>
            new APIContext("TasksGet").fetch(`/api/tasks`, {
              query: {
                bucket_id: bucket.id.toString(),
              },
            }),
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

export function useTasksPost(opts: { onSuccess: () => void }) {
  const { onSuccess } = opts;
  return useMutation({
    mutationFn: new APIContext("TasksPost").bodyFetch(`/api/tasks`, {
      method: "POST",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all() });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useProjectBucketsReset(opts: { project_id: number; onSuccess: () => void }) {
  const { onSuccess, project_id } = opts;
  return useMutation({
    mutationFn: () =>
      new APIContext("ProjectsDetailBucketsReset").fetch(`/api/projects/${project_id}/buckets`, {
        method: "PUT",
        body: {
          state: "default",
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all() });
      queryClient.invalidateQueries({ queryKey: bucketKeys.all() });
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
      queryClient.invalidateQueries({ queryKey: taskKeys.all() });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useTasksDetailDelete(opts: { onSuccess?: () => void; task_id: number }) {
  const { onSuccess, task_id } = opts;
  return useMutation({
    mutationFn: () =>
      new APIContext("TasksDetailDelete").fetch(`/api/tasks/${task_id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all() });
      queryClient.cancelQueries({ queryKey: taskKeys.detail(task_id) });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useBucketsPost(opts: { onSuccess: () => void }) {
  const { onSuccess } = opts;
  return useMutation({
    mutationFn: new APIContext("BucketsPost").bodyFetch(`/api/buckets`, {
      method: "POST",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bucketKeys.all() });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useBucketsDetailGet(opts: { bucket_id: number; enabled?: boolean }) {
  const { enabled, bucket_id } = opts;
  return useQuery({
    enabled,
    queryKey: bucketKeys.detail(bucket_id),
    queryFn: () => new APIContext("BucketsDetailGet").fetch(`/api/buckets/${bucket_id}`),
  });
}

export function useBucketsDetailPut(opts: { bucket_id: number; onSuccess?: () => void }) {
  const { bucket_id, onSuccess } = opts;
  return useMutation({
    mutationFn: new APIContext("BucketsDetailPut").bodyFetch(`/api/buckets/${bucket_id}`, {
      method: "put",
    }),
    onSuccess: () => {
      if (onSuccess) {
        onSuccess();
      }
      queryClient.invalidateQueries({ queryKey: bucketKeys.all() });
    },
  });
}

export function useBucketsDetailDelete(opts: { bucket_id: number; onSuccess?: () => void }) {
  const { bucket_id, onSuccess } = opts;
  return useMutation({
    mutationFn: () =>
      new APIContext("BucketsDetailDelete").fetch(`/api/buckets/${bucket_id}`, {
        method: "delete",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bucketKeys.all() });
      queryClient.cancelQueries({ queryKey: bucketKeys.detail(bucket_id) });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useTasksToProject(opts: { task_id: number }) {
  const { task_id } = opts;
  const task = useTasksDetailGet({
    task_id,
  });
  const bucket = useBucketsDetailGet({
    bucket_id: task.data?.bucket_id ?? 0,
    enabled: task.data != undefined,
  });
  const project = useProjectsDetailGet({
    project_id: bucket.data?.project_id ?? 0,
    enabled: bucket.data != undefined,
  });

  return {
    data: {
      task,
      bucket,
      project,
    },
    isFetching: [task, bucket, project].some((x) => x.isFetching),
  };
}
