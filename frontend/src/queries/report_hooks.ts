import { useMutation, useQuery } from "@tanstack/react-query";
import { APIContext } from "../helpers/fetch.ts";
import { queryClient } from "../helpers/queryclient.tsx";

const reportKeys = {
  all: () => ["reports"] as const,
  lists: () => [...reportKeys.all(), "list"] as const,
  list: (opts: { user_id?: number }) => [...reportKeys.lists(), opts] as const,
  details: () => [...reportKeys.all(), "detail"] as const,
  detail: (report_id: number) => [...reportKeys.details(), report_id] as const,
};

export function useReportsGet(opts: { user_id?: number }) {
  const { user_id } = opts;
  return useQuery({
    queryKey: reportKeys.list(opts),
    queryFn: () =>
      new APIContext("ReportsGet").fetch("/api/reports", {
        query: {
          user_id: user_id?.toString(),
        },
      }),
  });
}

export function useReportsDetailGet(opts: { report_id: number }) {
  const { report_id } = opts;
  return useQuery({
    queryKey: reportKeys.detail(opts.report_id),
    queryFn: () => new APIContext("ReportsDetailGet").fetch(`/api/reports/${report_id}`),
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
