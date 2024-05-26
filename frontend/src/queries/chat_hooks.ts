import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { API } from "../../../backend/src/routes";
import { APIContext } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";
import { socket } from "../helpers/socket";

// Mutation di sini nggak perlu manggil invalidateQuery karena kita pakai socket untuk nge-invalidate querynya.

export function useChatroomsDetailGet(chatroom_id: number) {
  return useQuery({
    queryKey: ["chatrooms", "detail", chatroom_id],
    queryFn: () => new APIContext("ChatroomsDetailGet").fetch(`/api/chatrooms/${chatroom_id}`),
  });
}

export function useChatroomsDetailMessagesGet(chatroom_id: number) {
  return useQuery({
    queryKey: ["messages", "detail", chatroom_id],
    queryFn: () =>
      new APIContext("ChatroomsDetailMessagesGet").fetch(`/api/chatrooms/${chatroom_id}/messages`),
  });
}

export function useChatroomsDetailMessagesPost(chatroom_id: number) {
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

export function useChatroomsDetailPut(chatroom_id: number, onSuccess?: () => void) {
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

export function useUsersDetailChatroomsPost(
  name: string,
  user_id: number | undefined,
  onSuccess?: () => void,
) {
  return useMutation({
    mutationFn: async () => {
      if (user_id === undefined) {
        throw new Error("User id invalid!");
      }
      return new APIContext("UsersDetailChatroomsPost").fetch(`/api/users/${user_id}/chatrooms`, {
        method: "POST",
        body: {
          name: name,
        },
      });
    },
    onSuccess: onSuccess,
  });
}

export function useProjectsDetailChatroomsPost(
  name: string,
  project_id: number,
  onSuccess?: () => void,
) {
  return useMutation({
    mutationFn: async () => {
      return new APIContext("ProjectsDetailChatroomsPost").fetch(
        `/api/projects/${project_id}/chatrooms`,
        {
          method: "POST",
          body: {
            name: name,
          },
        },
      );
    },
    onSuccess: onSuccess,
  });
}

export function useUsersDetailChatroomsGet(
  userId: number | undefined,
  retry?: (failureCount: number, error: Error) => boolean,
) {
  return useQuery({
    queryKey: ["chatrooms", "collection", "user", userId],
    queryFn: () =>
      new APIContext("UsersDetailChatroomsGet").fetch(`/api/users/${userId}/chatrooms`),
    retry: retry,
    enabled: userId !== undefined,
  });
}

export function useProjectsDetailChatroomsGet(projectId: number | undefined) {
  return useQuery({
    queryKey: ["chatrooms", "collection", "project", projectId],
    queryFn: () =>
      new APIContext("ProjectsDetailChatroomsGet").fetch(`/api/projects/${projectId}/chatrooms`),
    enabled: projectId !== undefined,
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
