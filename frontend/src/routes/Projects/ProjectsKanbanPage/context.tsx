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
      type: "move-over-task";
      task_id: number;
      over_task_id: number;
    }
  | {
      type: "move-over-container";
      task_id: number;
      over_container_id: number;
    }
  | {
      type: "lift";
      task_id: number;
    }
  | {
      type: "unlift";
    }
  | {
      type: "replace";
      data: KanbanData;
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

export function kanbanReducer(state: KanbanData, action: KanbanActions): KanbanData {
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

  if (action.type === "unlift") {
    return {
      ...state,
      draggedTask: undefined,
    };
  }

  if (action.type === "replace") {
    return action.data;
  }

  if (action.type === "move-over-task") {
    const cloned = structuredClone(buckets);

    // delete from prev
    const origin = findTaskFromBucket(cloned, action.task_id);
    if (origin == undefined) {
      return state;
    }
    const task = origin.bucket.tasks[origin.index];
    origin.bucket.tasks = origin.bucket.tasks.filter((x) => x.id !== action.task_id);

    // insert to new at idx
    const target = findTaskFromBucket(cloned, action.over_task_id);
    if (target == undefined) {
      return state;
    }
    target.bucket.tasks = target.bucket.tasks.flatMap((x, i) =>
      i !== target.index ? [x] : [task, x],
    );

    return {
      ...draggedTask,
      buckets: cloned,
    };
  }

  if (action.type === "move-over-container") {
    const cloned = structuredClone(buckets);

    // delete from prev
    const origin = findTaskFromBucket(cloned, action.task_id);
    if (origin == undefined) {
      return state;
    }
    const task = origin.bucket.tasks[origin.index];
    origin.bucket.tasks = origin.bucket.tasks.filter((x) => x.id !== action.task_id);

    // insert to new at idx
    const target = cloned.find((x) => x.id === action.over_container_id);
    if (target == undefined) {
      return state;
    }
    target.tasks = target.tasks.concat(task);

    return {
      ...draggedTask,
      buckets: cloned,
    };
  }

  return state;
}

export function useKanbanReducer() {
  return useReducer(kanbanReducer, { buckets: [] });
}

export const KanbanContext = createContext<ReturnType<typeof useKanbanReducer>>([
  { buckets: [] },
  () => {},
]);

export function useKanbanContext() {
  return useContext(KanbanContext);
}
