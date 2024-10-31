import { Dispatch, SetStateAction, createContext, useContext } from "react";

export type UserData = {
  email: string;
  username: string;
  password: string;
  education?: string;
  school?: string;
  website?: string;
  location?: string;
  social_medias: string[];
};

export type UserDataState = [UserData, Dispatch<SetStateAction<UserData>>];

export const RegistrationContext = createContext<UserDataState>([
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
