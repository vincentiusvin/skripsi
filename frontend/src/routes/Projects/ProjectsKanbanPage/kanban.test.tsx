import { KanbanData, findTaskFromBucket, kanbanReducer } from "./context.tsx";

function makeTask(id: number) {
  return {
    id,
    unique_id: `task-${id}`,
    name: `task${id}`,
    description: `desc${id}`,
    end_at: null,
    start_at: null,
    users: [],
  };
}

const state: KanbanData = {
  buckets: [
    {
      id: 1,
      unique_id: `bucket-1`,
      name: "Backlog",
      tasks: [makeTask(1), makeTask(2), makeTask(3)],
    },
    {
      id: 2,
      unique_id: `bucket-2`,
      name: "Doing",
      tasks: [makeTask(4), makeTask(5), makeTask(6)],
    },
    {
      id: 3,
      unique_id: `bucket-3`,
      name: "Done",
      tasks: [],
    },
  ],
};

// function printBuckets(state: KanbanData) {
//   return {
//     draggedTask: state.draggedTask,
//     buckets: state.buckets.map((x) => ({
//       id: x.id,
//       tasks: x.tasks.map((x) => x.id).join(","),
//     })),
//   };
// }

describe("kanban logic", () => {
  for (const task_id of [1, 2, 3, 4, 5, 6]) {
    it(`should be able to find task ${task_id} correctly`, () => {
      const res = findTaskFromBucket(state.buckets, task_id);
      expect(res).to.not.eq(undefined);
      const idx = res!.index!;
      const tasks = res!.bucket.tasks;
      expect(tasks[idx].id).to.eq(task_id);
    });
  }

  it("should be able to update state when lifting a task", () => {
    const in_task_id = 1;

    const result = kanbanReducer(state, {
      type: "lift",
      task_id: in_task_id,
    });

    const loc = findTaskFromBucket(result.buckets, in_task_id);

    expect(result.draggedTask?.task_id).to.eq(in_task_id);
    expect(result.draggedTask?.task_bucket).to.eq(loc?.bucket.id);
  });

  for (const task_id_1 of [1, 2, 3, 4, 5, 6]) {
    for (const task_id_2 of [1, 2, 3, 4, 5, 6]) {
      if (task_id_1 == task_id_2) {
        continue;
      }
      it(`should be able to move task ${task_id_1} to occupy the position of task ${task_id_2}`, () => {
        const in_task_id = task_id_1;
        const in_over_task_id = task_id_2;

        const overLoc = findTaskFromBucket(state.buckets, in_over_task_id);
        const result = kanbanReducer(state, {
          type: "move-over-task",
          task_id: in_task_id,
          over_task_id: in_over_task_id,
        });
        const newLoc = findTaskFromBucket(result.buckets, in_task_id);

        // should be in the new place
        expect(newLoc).to.not.eq(undefined);
        expect(newLoc?.bucket.tasks[newLoc.index].id).to.eq(in_task_id);
        expect(newLoc?.index).to.eq(overLoc?.index);

        let found = 0;
        let tally = 0;
        //should not exist twice or delete any other element
        for (const bucket of result.buckets) {
          for (const task of bucket.tasks) {
            if (task.id === in_task_id) {
              found += 1;
            }
            tally += 1;
          }
        }
        expect(found).to.eq(1);
        expect(tally).to.eq(6);
      });
    }
  }

  for (const container_id of [1, 2, 3]) {
    it(`should be able to insert task into bucket no ${container_id}`, () => {
      const in_task_id = 1;
      const in_container_id = container_id;

      const result = kanbanReducer(state, {
        type: "move-over-container",
        task_id: in_task_id,
        over_container_id: in_container_id,
      });
      const newLoc = findTaskFromBucket(result.buckets, in_task_id);

      // should be in the new place
      expect(newLoc).to.not.eq(undefined);
      expect(newLoc?.bucket.tasks[newLoc.index].id).to.eq(in_task_id);
      expect(newLoc?.index).to.eq(newLoc!.bucket.tasks.length - 1);
    });
  }
});
