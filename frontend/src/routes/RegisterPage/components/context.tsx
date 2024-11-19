import { createContext, useContext, useState } from "react";

export type UserRegister = {
  email?: string;
  username?: string;
  password?: string;
  registration_token?: string;
  education?: string;
  school?: string;
  website?: string;
  location?: string;
  workplace?: string;
  social_medias?: string[];
};

export function useUserRegisterState() {
  return useState<UserRegister>({});
}

export const RegistrationContext = createContext<ReturnType<typeof useUserRegisterState>>([
  {},
  () => {},
]);

export function useRegistrationContext() {
  return useContext(RegistrationContext);
}
