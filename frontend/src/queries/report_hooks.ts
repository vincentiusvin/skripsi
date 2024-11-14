import { useMutation, useQuery } from "@tanstack/react-query";
import { APIContext } from "../helpers/fetch.ts";
import { queryClient } from "../helpers/queryclient.tsx";

const reportKeys = {
  all: () => ["reports"] as const,
  lists: () => [...reportKeys.all(), "list"] as const,
  list: (opts: unknown) => [...reportKeys.lists(), opts] as const,
  details: () => [...reportKeys.all(), "detail"] as const,
  detail: (report_id: number) => [...reportKeys.details(), report_id] as const,
};

export function useReportsGet(opts: {
  limit?: number;
  page?: number;
  user_id?: number;
  status?: "Pending" | "Rejected" | "Resolved";
}) {
  const { status, user_id, page, limit } = opts;
  return useQuery({
    queryKey: reportKeys.list(opts),
    queryFn: () =>
      new APIContext("ReportsGet").fetch("/api/reports", {
        query: {
          user_id: user_id?.toString(),
          limit: limit?.toString(),
          page: page?.toString(),
          status,
        },
      }),
  });
}

export function useReportsDetailGet(opts: {
  report_id: number;
  retry?: (failurecount: number, error: unknown) => boolean;
}) {
  const { report_id, retry } = opts;
  return useQuery({
    queryKey: reportKeys.detail(opts.report_id),
    queryFn: () => new APIContext("ReportsDetailGet").fetch(`/api/reports/${report_id}`),
    retry,
  });
}

export function useReportsPost(opts?: { onSuccess?: () => void }) {
  const { onSuccess } = opts ?? {};
  return useMutation({
    mutationFn: new APIContext("ReportsPost").bodyFetch("/api/reports", {
      method: "POST",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: reportKeys.all(),
      });

      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useReportsPut(opts: { report_id: number; onSuccess?: () => void }) {
  const { report_id, onSuccess } = opts ?? {};
  return useMutation({
    mutationFn: new APIContext("ReportsDetailPut").bodyFetch(`/api/reports/${report_id}`, {
      method: "PUT",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: reportKeys.all(),
      });

      if (onSuccess) {
        onSuccess();
      }
    },
  });
}
