import { ReactNode } from "react";

export type ContentType = {
  title: string;
  steps: {
    title: string;
    content: ReactNode;
  }[];
};
