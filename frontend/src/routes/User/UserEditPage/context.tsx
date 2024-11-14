import { createContext, useContext, useState } from "react";

export type UserUpdateData = {
  user_name?: string;
  user_email?: string;
  user_school?: string;
  user_education_level?: string;
  user_about_me?: string;
  user_image?: string;
  user_website?: string;
  user_socials?: string[];
  user_workplace?: string;
  user_location?: string;
};

export function useUserEditState() {
  return useState<UserUpdateData>({});
}

export const UserEditContext = createContext<ReturnType<typeof useUserEditState>>([{}, () => {}]);

export function useUserEditContext() {
  return useContext(UserEditContext);
}
