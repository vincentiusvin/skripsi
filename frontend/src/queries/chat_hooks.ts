import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { API } from "../../../backend/src/routes";
import { APIContext } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";
import { socket } from "../helpers/socket";

// Mutation di sini nggak perlu manggil invalidateQuery karena kita pakai socket untuk nge-invalidate querynya.

export function useChatroomsDetailGet(opts: { chatroom_id: number }) {
  const { chatroom_id } = opts;
  return useQuery({
    queryKey: ["chatrooms", "detail", chatroom_id],
    queryFn: () => new APIContext("ChatroomsDetailGet").fetch(`/api/chatrooms/${chatroom_id}`),
  });
}

export function useChatroomsDetailMessagesGet(opts: { chatroom_id: number }) {
  const { chatroom_id } = opts;
  return useQuery({
    queryKey: ["messages", "detail", chatroom_id],
    queryFn: () =>
      new APIContext("ChatroomsDetailMessagesGet").fetch(`/api/chatrooms/${chatroom_id}/messages`),
  });
}

export function useChatroomsDetailMessagesPost(opts: { chatroom_id: number }) {
  const { chatroom_id } = opts;
  return useMutation({
    mutationFn: async (message: string) =>
      await new APIContext("ChatroomsDetailMessagesPost").fetch(
        `/api/chatrooms/${chatroom_id}/messages`,
        {
          method: "POST",
          body: {
            message: message,
          },
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
  retry?: (failureCount: number, error: Error) => boolean;
}) {
  const { user_id, retry } = opts;
  return useQuery({
    queryKey: ["chatrooms", "collection", "user", user_id],
    queryFn: () =>
      new APIContext("UsersDetailChatroomsGet").fetch(`/api/users/${user_id}/chatrooms`),
    retry: retry,
  });
}

export function useProjectsDetailChatroomsGet(opts: { project_id: number }) {
  const { project_id } = opts;
  return useQuery({
    queryKey: ["chatrooms", "collection", "project", project_id],
    queryFn: () =>
      new APIContext("ProjectsDetailChatroomsGet").fetch(`/api/projects/${project_id}/chatrooms`),
  });
}

export function useChatSocket(opts: {
  userId: number | undefined;
  onConnect?: () => void;
  onRoomUpdate?: () => void;
  onMsg?: (chatroom_id: number, msg: string) => void;
  onDisconnect?: () => void;
}) {
  const { onConnect, onRoomUpdate, onMsg, onDisconnect, userId: userId } = opts;
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
        queryKey: ["chatrooms"],
      });
      if (onRoomUpdate) {
        onRoomUpdate();
      }
    });

    socket.on("msg", (chatroom_id: number, msg: string) => {
      const msgObj: {
        message: string;
        user_id: number;
        created_at: Date;
      } = JSON.parse(msg);

      queryClient.setQueryData(
        ["messages", "detail", chatroom_id],
        (old: API["ChatroomsDetailMessagesGet"]["ResBody"]) => (old ? [...old, msgObj] : [msgObj]),
      );

      if (onMsg) {
        onMsg(chatroom_id, msg);
      }
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
