import { useMutation, useQuery } from "@tanstack/react-query";
import { APIContext } from "../helpers/fetch";

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
