import { useMutation, useQuery } from "@tanstack/react-query";
import { APIContext } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";

export function useUsersPost(opts?: { onSuccess?: () => void }) {
  const { onSuccess } = opts ?? {};
  return useMutation({
    mutationFn: new APIContext("UsersPost").bodyFetch("/api/users", {
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

export function useUsersGet() {
  return useQuery({
    queryKey: ["users", "collection"],
    queryFn: () => new APIContext("UsersGet").fetch("/api/users"),
  });
}

export function useUserAccountDetailGet(opts: {
  user_id: number;
  retry?: (failurecount: number, error: any) => boolean;
  enabled?: boolean;
}) {
  const { user_id, retry, enabled } = opts;
  return useQuery({
    enabled,
    queryKey: ["users", "detail", user_id],
    queryFn: () => new APIContext("UserAccountGet").fetch(`/api/user/account/${user_id}`),
    retry: retry,
  });
}

export function useUserAccountDetailUpdate(opts: {
  user_id: number;
  name?: string;
  password?: string;
  confirmPassword?: string;
  email?: string;
  educationLevel?: string;
  school?: string;
  about_me?: string;
  image?: string;
  onSuccess?: () => void;
}) {
  const { user_id, name, password, email, educationLevel, school, about_me, image, onSuccess } =
    opts;
  return useMutation({
    mutationFn: () =>
      new APIContext("UserAccountUpdate").fetch(`/api/user/account/${user_id}`, {
        method: "PUT",
        body: {
          user_name: name,
          user_password: password,
          user_email: email,
          user_education_level: educationLevel,
          user_school: school,
          user_about_me: about_me,
          user_image: image,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}
