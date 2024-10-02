import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { APIContext } from "../helpers/fetch.ts";
import { queryClient } from "../helpers/queryclient.tsx";

const suspensionKeys = {
  all: () => ["suspensions"] as const,
  lists: () => [...suspensionKeys.all(), "list"] as const,
  list: (opts: { user_id?: number; expired_after?: string; expired_before?: string }) =>
    [...suspensionKeys.all(), "list", opts] as const,
  details: () => [...suspensionKeys.all(), "detail"] as const,
  detail: (suspension_id: number) => [...suspensionKeys.details(), suspension_id] as const,
};

export function useSuspensionsGet(opts: {
  user_id?: number;
  expired_after?: dayjs.Dayjs;
  expired_before?: dayjs.Dayjs;
}) {
  const { user_id, expired_after, expired_before } = opts;

  return useQuery({
    queryKey: suspensionKeys.list({
      user_id,
      expired_after: expired_after?.toISOString(),
      expired_before: expired_before?.toISOString(),
    }),
    queryFn: () =>
      new APIContext("SuspensionsGet").fetch("/api/suspensions", {
        query: {
          user_id: user_id?.toString(),
          expired_after: expired_after?.toISOString(),
          expired_before: expired_before?.toISOString(),
        },
      }),
  });
}

export function useSuspensionsDetailGet(opts: { suspension_id: number }) {
  const { suspension_id } = opts;
  return useQuery({
    queryKey: suspensionKeys.detail(opts.suspension_id),
    queryFn: () =>
      new APIContext("SuspensionsDetailGet").fetch(`/api/suspensions/${suspension_id}`),
  });
}

export function useSuspensionsPost(opts?: { onSuccess?: () => void }) {
  const { onSuccess } = opts ?? {};
  return useMutation({
    mutationFn: new APIContext("SuspensionsPost").bodyFetch("/api/suspensions", {
      method: "POST",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suspensionKeys.all(),
      });

      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useSuspensionsDetailPut(opts: { suspension_id: number; onSuccess?: () => void }) {
  const { suspension_id, onSuccess } = opts ?? {};
  return useMutation({
    mutationFn: new APIContext("SuspensionsDetailPut").bodyFetch(
      `/api/suspensions/${suspension_id}`,
      {
        method: "PUT",
      },
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suspensionKeys.all(),
      });

      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useSuspensionsDetailDelete(opts: {
  suspension_id: number;
  onSuccess?: () => void;
}) {
  const { suspension_id, onSuccess } = opts ?? {};
  return useMutation({
    mutationFn: new APIContext("SuspensionsDetailDelete").bodyFetch(
      `/api/suspensions/${suspension_id}`,
      {
        method: "delete",
      },
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suspensionKeys.all(),
      });

      if (onSuccess) {
        onSuccess();
      }
    },
  });
}
