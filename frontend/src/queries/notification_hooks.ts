import { useMutation, useQuery } from "@tanstack/react-query";
import { APIContext } from "../helpers/fetch.ts";
import { queryClient } from "../helpers/queryclient.tsx";

const notifKeys = {
  all: () => ["notifications"] as const,
  lists: () => [...notifKeys.all(), "list"] as const,
  list: (opts?: { user_id?: number; read?: boolean }) =>
    [...notifKeys.all(), "list", opts] as const,
  details: () => [...notifKeys.all(), "detail"] as const,
  detail: (notif_id: number) => [...notifKeys.details(), notif_id] as const,
};

export function useNotificationsGet(opts: {
  user_id?: number;
  read?: boolean;
  retry?: (failureCount: number, error: Error) => boolean;
}) {
  const { user_id, read, retry } = opts;
  let read_string: "true" | "false" | undefined = undefined;
  if (read != undefined) {
    read_string = read ? "true" : "false";
  }

  return useQuery({
    queryKey: notifKeys.list({ user_id }),
    queryFn: () =>
      new APIContext("NotificationsGet").fetch(`/api/notifications`, {
        query: {
          user_id: user_id?.toString(),
          read: read_string,
        },
      }),
    retry: retry,
  });
}

export function useNotificationsPut(opts: { notification_id: number; onSuccess?: () => void }) {
  const { notification_id, onSuccess } = opts;
  return useMutation({
    mutationFn: new APIContext("NotificationsPut").bodyFetch(
      `/api/notifications/${notification_id}`,
      {
        method: "PUT",
      },
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notifKeys.all() });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useNotificationsMassPut(opts: { user_id: number; onSuccess?: () => void }) {
  const { user_id, onSuccess } = opts;
  return useMutation({
    mutationFn: new APIContext("NotificationsMassPut").bodyFetch(`/api/notifications`, {
      method: "PUT",
      query: {
        user_id: user_id.toString(),
      },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notifKeys.all() });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}
