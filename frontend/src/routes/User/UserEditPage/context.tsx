import { createContext, useContext, useState } from "react";

export type UserUpdateData = {
  user_name: undefined | string;
  user_email: undefined | string;
  user_school: undefined | string;
  user_education_level: undefined | string;
  user_about_me: undefined | string;
  user_image: undefined | string;
  user_socials: undefined | string[];
};

export function useUserEditState() {
  return useState<UserUpdateData>({
    user_name: undefined,
    user_email: undefined,
    user_school: undefined,
    user_education_level: undefined,
    user_about_me: undefined,
    user_image: undefined,
    user_socials: undefined,
  });
}

export const UserEditContext = createContext<ReturnType<typeof useUserEditState>>([
  {
    user_name: undefined,
    user_email: undefined,
    user_school: undefined,
    user_education_level: undefined,
    user_about_me: undefined,
    user_image: undefined,
    user_socials: undefined,
  },
  () => {},
]);

export function useUserEditContext() {
  return useContext(UserEditContext);
}
