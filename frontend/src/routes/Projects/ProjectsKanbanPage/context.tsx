import { createContext, useContext, useReducer } from "react";

export type KanbanData = {
  draggedTask?: {
    task_id: number;
    task_bucket: number;
  };
  buckets: {
    id: number;
    name: string;
    tasks: {
      id: number;
      name: string;
      description: string | null;
      end_at: Date | null;
      start_at: Date | null;
      users: {
        user_id: number;
      }[];
    }[];
  }[];
};

export type KanbanActions =
  | {
      type: "move";
      task_id: number;
      over_id: number;
    }
  | {
      type: "lift";
      task_id: number;
    }
  | {
      type: "replace";
      task_id: number;
    };

export function findTaskFromBucket(buckets: KanbanData["buckets"], task_id: number) {
  for (const bucket of buckets) {
    const index = bucket.tasks.findIndex((x) => x.id === task_id);
    if (index !== -1) {
      return { bucket, index };
    }
  }
  return undefined;
}

function reducer(state: KanbanData, action: KanbanActions): KanbanData {
  const { buckets, draggedTask } = state;

  if (action.type === "lift") {
    const associated_bucket = findTaskFromBucket(buckets, action.task_id);
    if (associated_bucket == undefined) {
      return state;
    }
    return {
      ...state,
      draggedTask: {
        task_id: action.task_id,
        task_bucket: associated_bucket.bucket.id,
      },
    };
  }
  if (action.type === "move") {
    const origin_bucket = findTaskFromBucket(buckets, action.task_id);
    const target_bucket = findTaskFromBucket(buckets, action.over_id);

    const cloned = structuredClone(buckets);
  }

  return state;
}

export function useKanbanReducer() {
  return useReducer(reducer, { buckets: [] });
}

export const KanbanContext = createContext<ReturnType<typeof useKanbanReducer>>([{}, () => {}]);

export function useKanbanContext() {
  return useContext(KanbanContext);
}
