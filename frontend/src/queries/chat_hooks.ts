import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { API } from "../../../backend/src/routes";
import { APIContext } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";
import { socket } from "../helpers/socket";

// Mutation di sini nggak perlu manggil invalidateQuery karena kita pakai socket untuk nge-invalidate querynya.

export function useChatroomDetail(chatroom_id: number) {
  return useQuery({
    queryKey: ["chatrooms", "detail", chatroom_id],
    queryFn: () => new APIContext("GetChatroomDetail").fetch(`/api/chatrooms/${chatroom_id}`),
  });
}

export function useMessage(chatroom_id: number) {
  return useQuery({
    queryKey: ["messages", "detail", chatroom_id],
    queryFn: () => new APIContext("GetMessages").fetch(`/api/chatrooms/${chatroom_id}/messages`),
  });
}

export function useSendMessage(chatroom_id: number, message: string, onSettled?: () => void) {
  return useMutation({
    mutationFn: async () =>
      await new APIContext("PostMessages").fetch(`/api/chatrooms/${chatroom_id}/messages`, {
        method: "POST",
        body: {
          message: message,
        },
      }),
    onSettled: onSettled,
  });
}

export function useEditRoom(
  chatroom_id: number,
  name: string,
  user_ids: number[],
  onSuccess?: () => void,
) {
  return useMutation({
    mutationFn: async () => {
      const res = await new APIContext("PutChatroom").fetch(`/api/chatrooms/${chatroom_id}`, {
        method: "PUT",
        body: {
          name: name,
          user_ids: user_ids,
        },
      });
      return res;
    },
    onSuccess: onSuccess,
  });
}

export function useCreateRoom(name: string, user_ids: number[], onSuccess?: () => void) {
  return useMutation({
    mutationFn: async () => {
      if (user_ids.length === 0) {
        throw new Error("Anda harus login untuk membuat ruangan!");
      }
      return new APIContext("PostChatrooms").fetch("/api/chatrooms", {
        method: "POST",
        body: {
          name: name,
          user_ids: user_ids,
        },
      });
    },
    onSuccess: onSuccess,
  });
}

export function useChatroom(
  userId: number | undefined,
  retry?: (failureCount: number, error: Error) => boolean,
) {
  return useQuery({
    queryKey: ["chatrooms", "collection", userId],
    queryFn: () => new APIContext("GetChatrooms").fetch("/api/chatrooms"),
    retry: retry,
    enabled: userId !== undefined,
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
        (old: API["GetMessages"]["ResBody"]) => (old ? [...old, msgObj] : [msgObj]),
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
