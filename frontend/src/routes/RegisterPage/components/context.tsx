import { createContext, useContext, useState } from "react";

export type UserRegister = {
  email: string;
  username: string;
  password: string;
  education?: string;
  school?: string;
  website?: string;
  location?: string;
  workplace?: string;
  social_medias: string[];
};

export function useUserRegisterState() {
  return useState<UserRegister>({
    email: "",
    password: "",
    social_medias: ["", ""],
    username: "",
  });
}

export const RegistrationContext = createContext<ReturnType<typeof useUserRegisterState>>([
  {
    username: "",
    password: "",
    email: "",
    social_medias: [""],
  },
  () => {},
]);

export function useRegistrationContext() {
  return useContext(RegistrationContext);
}
