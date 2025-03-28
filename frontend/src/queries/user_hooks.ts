import { useMutation, useQuery } from "@tanstack/react-query";
import { isEqual } from "lodash";
import { useDebounce } from "use-debounce";
import { APIContext } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";
import { sessionKeys } from "./sesssion_hooks.ts";

const userKeys = {
  all: () => ["users"] as const,
  lists: () => [...userKeys.all(), "list"] as const,
  list: (opts: { keyword?: string; page?: number; limit?: number }) =>
    [...userKeys.all(), "list", opts] as const,
  details: () => [...userKeys.all(), "detail"] as const,
  detail: (user_id: number) => [...userKeys.details(), user_id] as const,
  preferences: (user_id: number) => [...userKeys.detail(user_id), "prefs"] as const,
  otp: (opts: { email: string; type: "Register" | "Password" }) => ["otp", opts],
  otp_user: (opts: { token: string }) => ["otp", opts, "user"],
};

export function useUsersPost(opts?: { onSuccess?: () => void }) {
  const { onSuccess } = opts ?? {};
  return useMutation({
    mutationFn: new APIContext("UsersPost").bodyFetch("/api/users", {
      method: "POST",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: sessionKeys.session(),
      });

      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useOTPToken(opts: { email: string; type: "Register" | "Password" }) {
  const { email, type } = opts;

  return useQuery({
    queryKey: userKeys.otp(opts),
    queryFn: () =>
      new APIContext("OTPPost").fetch("/api/otps", {
        method: "POST",
        body: {
          type,
          email: email,
        },
      }),
    staleTime: 60 * 60 * 1000,
  });
}

export function useOTPDetailUserGet(opts: { token: string }) {
  const { token } = opts;

  return useQuery({
    queryKey: userKeys.otp_user(opts),
    queryFn: () =>
      new APIContext("OTPDetailGetUser").fetch(`/api/otps/${token}/user`, {
        method: "GET",
      }),
  });
}

export function useOTPVerify(opts: { onSuccess?: () => void; token: string }) {
  const { token, onSuccess } = opts;

  return useMutation({
    mutationFn: new APIContext("OTPDetailPut").bodyFetch(`/api/otps/${token}`, {
      method: "PUT",
    }),
    onSuccess: (x) => {
      if (onSuccess) {
        onSuccess();
      }
      queryClient.setQueryData(
        userKeys.otp({
          email: x.email,
          type: x.type,
        }),
        x,
      );
    },
  });
}

export function useUserValidation(opts: { email?: string; name?: string; existing?: boolean }) {
  const { email, name, existing } = opts;

  const inputData = {
    email,
    name,
  };

  const [debouncedData] = useDebounce(inputData, 300);

  const isUpdated = isEqual(debouncedData, inputData);

  const query = useQuery({
    queryKey: ["validation", debouncedData],
    queryFn: () =>
      new APIContext("UsersValidate").fetch("/api/users-validation", {
        method: "get",
        query: {
          email: debouncedData.email,
          name: debouncedData.name,
          existing: existing === true ? "true" : undefined,
        },
      }),
  });
  const { data: validationData } = query;

  const isValid =
    isUpdated &&
    validationData != undefined &&
    validationData.email == undefined &&
    validationData.name == undefined;

  return {
    isValid,
    data: validationData,
  };
}

export function useOTPsResend(opts: { onSuccess?: () => void; token: string }) {
  const { onSuccess, token } = opts;

  return useMutation({
    mutationFn: () =>
      new APIContext("OTPDetailMail").fetch(`/api/otps/${token}/email`, {
        method: "post",
      }),
    onSuccess: () => {
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useUsersGet(opts?: { keyword?: string; page?: number; limit?: number }) {
  const { keyword, page, limit } = opts ?? {};
  const clean_keyword = keyword != undefined && keyword.length > 0 ? keyword : undefined;
  return useQuery({
    queryKey: userKeys.list({ keyword: clean_keyword, page, limit }),
    queryFn: () =>
      new APIContext("UsersGet").fetch("/api/users", {
        query: {
          keyword: clean_keyword,
          page: page?.toString(),
          limit: limit?.toString(),
        },
      }),
  });
}

export function useUsersDetailGet(opts: {
  user_id: number;
  retry?: (failurecount: number, error: unknown) => boolean;
}) {
  const { user_id, retry } = opts;
  return useQuery({
    queryKey: userKeys.detail(user_id),
    queryFn: () => new APIContext("UsersDetailGet").fetch(`/api/users/${user_id}`),
    retry: retry,
  });
}

export function useUsersDetailUpdate(opts: { user_id: number; onSuccess?: () => void }) {
  const { user_id, onSuccess } = opts;
  return useMutation({
    mutationFn: new APIContext("UsersDetailPut").bodyFetch(`/api/users/${user_id}`, {
      method: "PUT",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all() });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useUsersDetailUpdatePassword(opts: { user_id: number; onSuccess?: () => void }) {
  const { user_id, onSuccess } = opts;
  return useMutation({
    mutationFn: new APIContext("UsersDetailPutPassword").bodyFetch(
      `/api/users/${user_id}/password`,
      {
        method: "PUT",
      },
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all() });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useUsersDetailUpdateEmail(opts: { user_id: number; onSuccess?: () => void }) {
  const { user_id, onSuccess } = opts;
  return useMutation({
    mutationFn: new APIContext("UsersDetailPutEmail").bodyFetch(`/api/users/${user_id}/email`, {
      method: "PUT",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all() });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useUsersDetailPreferencesPut(opts: { user_id: number; onSuccess?: () => void }) {
  const { user_id, onSuccess } = opts;
  return useMutation({
    mutationFn: new APIContext("PreferencesPut").bodyFetch(`/api/users/${user_id}/preferences`, {
      method: "put",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.preferences(user_id) });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

export function useUsersDetailPreferencesGet(opts: { user_id: number }) {
  const { user_id } = opts;
  return useQuery({
    queryKey: userKeys.preferences(user_id),
    queryFn: () => new APIContext("PreferencesGet").fetch(`/api/users/${user_id}/preferences`),
  });
}
