import { Dispatch, SetStateAction, createContext, useContext } from "react";

export type NavigationRaw = "browse" | `project-${number}` | `orgs-${number}` | "admin";
export type NavigationData =
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
    };

export function parseNavigationRaw(x: NavigationRaw): NavigationData {
  if (x === "browse") {
    return {
      type: "browse",
    };
  } else if (x.startsWith("project-")) {
    const project_id = Number(x.split("-")[1]);
    return {
      type: "project",
      id: project_id,
    };
  } else if (x.startsWith("orgs-")) {
    const org_id = Number(x.split("-")[1]);
    return {
      type: "orgs",
      id: org_id,
    };
  } else if (x === "admin") {
    return {
      type: "admin",
    };
  }
  return {
    type: "browse",
  };
}

export function parseNavigation(x: NavigationData): NavigationRaw {
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
  },
  () => {},
]);

export function useNavigation() {
  return useContext(NavigationContext);
}
