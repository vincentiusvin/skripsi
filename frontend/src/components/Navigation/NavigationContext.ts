import { Dispatch, SetStateAction, createContext, useContext } from "react";

export type NavigationRaw = "browse" | `project-${number}` | `orgs-${number}` | "admin";
export type NavigationData = { open: boolean } & (
  | {
      type: "browse";
    }
  | {
      type: "admin";
    }
  | {
      type: "project";
      id: number;
    }
  | {
      type: "orgs";
      id: number;
    }
);

export function navRaw2NavData(x: NavigationRaw, state: boolean): NavigationData {
  if (x === "browse") {
    return {
      open: state,
      type: "browse",
    };
  } else if (x.startsWith("project-")) {
    const project_id = Number(x.split("-")[1]);
    return {
      type: "project",
      open: state,
      id: project_id,
    };
  } else if (x.startsWith("orgs-")) {
    const org_id = Number(x.split("-")[1]);
    return {
      type: "orgs",
      open: state,
      id: org_id,
    };
  } else if (x === "admin") {
    return {
      type: "admin",
      open: state,
    };
  }
  return {
    type: "browse",
    open: state,
  };
}

export function navData2NavRaw(x: NavigationData): NavigationRaw {
  if ("id" in x) {
    return `${x.type}-${x.id}`;
  } else {
    return `${x.type}`;
  }
}

export const NavigationContext = createContext<
  [NavigationData, Dispatch<SetStateAction<NavigationData>>]
>([
  {
    type: "browse",
    open: true,
  },
  () => {},
]);

export function useNavigation() {
  return useContext(NavigationContext);
}
