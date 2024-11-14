import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { API } from "../../../backend/src/routes";
import type { MessageData } from "../../../backend/src/sockets";
import { APIContext } from "../helpers/fetch";
import { handleOptionalStringCreation } from "../helpers/misc.ts";
import { queryClient } from "../helpers/queryclient";
import { socket } from "../helpers/socket";

const chatKeys = {
  all: () => ["chatroom"] as const,
  lists: () => [...chatKeys.all(), "list"] as const,
  list: (param: unknown) => [...chatKeys.lists(), param] as const,
  details: () => [...chatKeys.all(), "detail"] as const,
  detail: (chat_id: number) => [...chatKeys.details(), chat_id] as const,
};

const messageKeys = {
  all: () => ["message"] as const,
  lists: () => [...messageKeys.all(), "list"] as const,
  list: (chat_id: number) => [...messageKeys.lists(), { chat_id }] as const,
  details: () => [...messageKeys.all(), "detail"] as const,
  detail: (message_id: number) => [...messageKeys.details(), message_id] as const,
};

// Mutation di sini nggak perlu manggil invalidateQuery karena kita pakai socket untuk nge-invalidate querynya.

export function useChatroomsDetailGet(opts: {
  chatroom_id: number;
  retry?: (failureCount: number, error: Error) => boolean;
}) {
  const { retry, chatroom_id } = opts;
  return useQuery({
    queryKey: chatKeys.detail(chatroom_id),
    queryFn: () => new APIContext("ChatroomsDetailGet").fetch(`/api/chatrooms/${chatroom_id}`),
    retry,
  });
}

export function useChatroomsDetailMessagesGet(opts: { chatroom_id: number }) {
  const { chatroom_id } = opts;
  return useQuery({
    queryKey: messageKeys.list(chatroom_id),
    queryFn: () =>
      new APIContext("ChatroomsDetailMessagesGet").fetch(`/api/chatrooms/${chatroom_id}/messages`),
  });
}

export function useChatroomsDetailMessagesPost(opts: { chatroom_id: number }) {
  const { chatroom_id } = opts;
  return useMutation({
    mutationFn: new APIContext("ChatroomsDetailMessagesPost").bodyFetch(
      `/api/chatrooms/${chatroom_id}/messages`,
      {
        method: "POST",
      },
    ),
  });
}

export function useChatroomsDetailMessagesPut(opts: { chatroom_id: number; message_id: number }) {
  const { chatroom_id, message_id } = opts;
  return useMutation({
    mutationFn: new APIContext("ChatroomsDetailMessagesPut").bodyFetch(
      `/api/chatrooms/${chatroom_id}/messages/${message_id}`,
      {
        method: "PUT",
      },
    ),
  });
}

export function useChatroomsDetailPut(opts: { chatroom_id: number; onSuccess?: () => void }) {
  const { chatroom_id, onSuccess } = opts;
  return useMutation({
    mutationFn: async (opts: { name?: string; user_ids?: number[] }) => {
      const res = await new APIContext("ChatroomsDetailPut").fetch(
        `/api/chatrooms/${chatroom_id}`,
        {
          method: "PUT",
          body: {
            name: opts.name,
            user_ids: opts.user_ids,
          },
        },
      );
      return res;
    },
    onSuccess: onSuccess,
  });
}

export function useChatroomsDetailDelete(opts: { chatroom_id: number; onSuccess?: () => void }) {
  const { chatroom_id, onSuccess } = opts;
  return useMutation({
    mutationFn: async () => {
      const res = await new APIContext("ChatroomsDetailDelete").fetch(
        `/api/chatrooms/${chatroom_id}`,
        {
          method: "delete",
        },
      );
      return res;
    },
    onSuccess: onSuccess,
  });
}

export function useUsersDetailChatroomsPost(opts: { user_id?: number; onSuccess?: () => void }) {
  const { user_id, onSuccess } = opts;
  return useMutation({
    mutationFn: new APIContext("UsersDetailChatroomsPost").bodyFetch(
      `/api/users/${user_id}/chatrooms`,
      {
        method: "POST",
      },
    ),
    onSuccess: onSuccess,
  });
}

export function useProjectsDetailChatroomsPost(opts: {
  project_id: number;
  onSuccess?: () => void;
}) {
  const { project_id, onSuccess } = opts;
  return useMutation({
    mutationFn: new APIContext("ProjectsDetailChatroomsPost").bodyFetch(
      `/api/projects/${project_id}/chatrooms`,
      {
        method: "POST",
      },
    ),
    onSuccess: onSuccess,
  });
}

export function useUsersDetailChatroomsGet(opts: {
  user_id: number | undefined;
  keyword?: string;
  retry?: (failureCount: number, error: Error) => boolean;
}) {
  const { user_id, keyword, retry } = opts;

  const cleanedKeyword = handleOptionalStringCreation(keyword);

  return useQuery({
    queryKey: chatKeys.list({ user_id, keyword: cleanedKeyword }),
    queryFn: () =>
      new APIContext("UsersDetailChatroomsGet").fetch(`/api/users/${user_id}/chatrooms`, {
        query: {
          keyword: cleanedKeyword,
        },
      }),
    retry: retry,
  });
}

export function useProjectsDetailChatroomsGet(opts: { project_id: number; keyword?: string }) {
  const { project_id, keyword } = opts;

  const cleanedKeyword = handleOptionalStringCreation(keyword);

  return useQuery({
    queryKey: chatKeys.list({ project_id, keyword: cleanedKeyword }),
    queryFn: () =>
      new APIContext("ProjectsDetailChatroomsGet").fetch(`/api/projects/${project_id}/chatrooms`, {
        query: {
          keyword: cleanedKeyword,
        },
      }),
  });
}

export function useChatSocket(opts: {
  userId: number | undefined;
  onConnect?: () => void;
  onRoomUpdate?: () => void;
  onDisconnect?: () => void;
}) {
  const { onConnect, onRoomUpdate, onDisconnect, userId: userId } = opts;
  useEffect(() => {
    if (userId === undefined) {
      return () => {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("roomUpdate");
        socket.off("msg");
        socket.disconnect();
      };
    }
    socket.connect();
    if (onConnect) {
      socket.on("connect", onConnect);
    }
    socket.on("roomUpdate", () => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.all(),
      });
      if (onRoomUpdate) {
        onRoomUpdate();
      }
    });

    socket.on("msg", (chatroom_id: number, data: MessageData) => {
      queryClient.setQueryData(
        messageKeys.list(chatroom_id),
        (old: API["ChatroomsDetailMessagesGet"]["ResBody"]) => (old ? [...old, data] : [data]),
      );
    });

    socket.on("msgUpd", (chatroom_id: number, data: MessageData) => {
      queryClient.setQueryData(
        messageKeys.list(chatroom_id),
        (old: API["ChatroomsDetailMessagesGet"]["ResBody"]) => {
          const cloned = structuredClone(old);
          const found = cloned.find((x) => x.id === data.id);
          if (!found) {
            return old;
          }
          Object.assign(found, data);
          return cloned;
        },
      );
    });

    if (onDisconnect) {
      socket.on("disconnect", onDisconnect);
    }

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("roomUpdate");
      socket.off("msg");
      socket.disconnect();
    };
  }, [userId]);
}
