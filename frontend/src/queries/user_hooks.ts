import { useMutation, useQuery } from "@tanstack/react-query";
import { APIContext } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";

export function useRegister(username: string, password: string, onSuccess?: () => void) {
  return useMutation({
    mutationFn: () =>
      new APIContext("PostUser").fetch("/api/users", {
        body: {
          user_name: username,
          user_password: password,
        },
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => new APIContext("GetUser").fetch("/api/users"),
  });
}
