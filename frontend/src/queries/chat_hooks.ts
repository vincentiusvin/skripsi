import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
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

type ChatroomMessages = API["ChatroomsDetailMessagesGet"]["ResBody"];
type ChatroomMessagesPages = {
  pages: ChatroomMessages[];
  pageParams: (undefined | string)[];
};

export function useChatroomsDetailMessagesGet(opts: { chatroom_id: number }) {
  const { chatroom_id } = opts;
  return useInfiniteQuery<ChatroomMessages>({
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      const last_message = lastPage[lastPage.length - 1];
      if (last_message == undefined) {
        return undefined;
      }
      return last_message.id.toString();
    },
    queryKey: messageKeys.list(chatroom_id),
    queryFn: ({ pageParam }) => {
      return new APIContext("ChatroomsDetailMessagesGet").fetch(
        `/api/chatrooms/${chatroom_id}/messages`,
        {
          query: {
            before_message_id: typeof pageParam === "string" ? pageParam : undefined,
            limit: "10",
          },
        },
      );
    },
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
    mutationFn: async (opts: { name?: string }) => {
      const res = await new APIContext("ChatroomsDetailPut").fetch(
        `/api/chatrooms/${chatroom_id}`,
        {
          method: "PUT",
          body: {
            name: opts.name,
          },
        },
      );
      return res;
    },
    onSuccess: onSuccess,
  });
}

export function useChatroomsDetailUserDetailPut(opts: {
  chatroom_id: number;
  user_id: number;
  onSuccess?: () => void;
}) {
  const { chatroom_id, user_id, onSuccess } = opts;
  return useMutation({
    mutationFn: async () => {
      const res = await new APIContext("ChatroomsDetailUsersDetailPut").fetch(
        `/api/chatrooms/${chatroom_id}/users/${user_id}`,
        {
          method: "PUT",
          body: {
            role: "Member",
          },
        },
      );
      return res;
    },
    onSuccess: onSuccess,
  });
}

export function useChatroomsDetailUserDetailDelete(opts: {
  chatroom_id: number;
  user_id: number;
  onSuccess?: () => void;
}) {
  const { chatroom_id, user_id, onSuccess } = opts;
  return useMutation({
    mutationFn: async () => {
      const res = await new APIContext("ChatroomsDetailUsersDetailDelete").fetch(
        `/api/chatrooms/${chatroom_id}/users/${user_id}`,
        {
          method: "DELETE",
          body: {
            role: "Member",
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
    onSuccess: () => {
      queryClient.cancelQueries({
        queryKey: chatKeys.detail(chatroom_id),
      });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useChatroomsPost(opts: {
  onSuccess?: (data: {
    chatroom_id: number;
    project_id: number | null;
    chatroom_name: string;
    chatroom_created_at: Date;
    chatroom_users: {
      user_id: number;
    }[];
  }) => void;
}) {
  const { onSuccess } = opts;
  return useMutation({
    mutationFn: new APIContext("ChatroomsPost").bodyFetch(`/api/chatrooms`, {
      method: "POST",
    }),
    onSuccess: onSuccess,
  });
}

export function useChatroomsGet(opts: {
  user_id?: number;
  project_id?: number;
  keyword?: string;
  retry?: (failureCount: number, error: Error) => boolean;
}) {
  const { user_id, project_id, keyword, retry } = opts;

  const cleanedKeyword = handleOptionalStringCreation(keyword);

  return useQuery({
    queryKey: chatKeys.list({ user_id, keyword: cleanedKeyword, project_id }),
    queryFn: () =>
      new APIContext("ChatroomsGet").fetch(`/api/chatrooms`, {
        query: {
          project_id: project_id?.toString(),
          user_id: user_id?.toString(),
          keyword: cleanedKeyword,
        },
      }),
    retry: retry,
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
      queryClient.setQueryData(messageKeys.list(chatroom_id), (old: ChatroomMessagesPages) => {
        const [firstPage, ...rest] = old.pages;
        const firstPageReplacement = firstPage == undefined ? [data] : [data, ...firstPage];
        return {
          pages: [firstPageReplacement, ...rest],
          pageParams: old.pageParams,
        };
      });
    });

    socket.on("msgUpd", (chatroom_id: number, data: MessageData) => {
      queryClient.setQueryData(messageKeys.list(chatroom_id), (old: ChatroomMessagesPages) => {
        const cloned = structuredClone(old.pages);
        for (const page of cloned) {
          for (const msg of page) {
            if (msg.id !== data.id) {
              continue;
            }
            Object.assign(msg, data);
          }
        }

        return {
          pages: cloned,
          pageParams: old.pageParams,
        };
      });
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
