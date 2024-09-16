import { createContext, useContext } from "react";

export const ThemeContext = createContext<["light" | "dark", (x: "light" | "dark") => void]>([
  "light",
  () => {},
]);

export function useAppTheme() {
  return useContext(ThemeContext);
}
