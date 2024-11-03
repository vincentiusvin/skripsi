import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Add } from "@mui/icons-material";
import { Box, BoxProps, Button, Skeleton, Stack, TextField, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { ReactNode, useEffect, useState } from "react";
import { useParams } from "wouter";
import {
  useBucketsPost,
  useFormattedTasks,
  useTasksDetailPut,
} from "../../../queries/task_hooks.ts";
import AuthorizeProjects from "../components/AuthorizeProjects.tsx";
import AddTaskDialog from "./AddTaskDialog.tsx";
import EditBucketDialog from "./EditBucketDialog.tsx";
import Task from "./TaskCard.tsx";

function extractID(str: string): number | undefined {
  const id = str.split("-")[1];
  return id != undefined ? Number(id) : undefined;
}

function DraggableTask(props: { id: string; project_id: number; isDragged?: boolean }) {
  const { project_id, id, isDragged } = props;
  const {
    attributes,
    listeners,
    setActivatorNodeRef: activatorRef,
    setNodeRef: draggableRef,
    transform,
    transition,
  } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const task_id = extractID(id);
  if (task_id == undefined) {
    return <Skeleton />;
  }

  return (
    <Task
      project_id={project_id}
      task_id={task_id}
      isDragged={isDragged}
      handleProps={{
        ref: activatorRef,
        ...listeners,
      }}
      fullProps={{
        ref: draggableRef,
        ...attributes,
        style,
      }}
    />
  );
}

function Column(props: { id: string; items: string[]; children: ReactNode } & BoxProps) {
  const { id, items, children, ...rest } = props;
  const { setNodeRef: draggableRef } = useDroppable({
    id,
  });

  return (
    <SortableContext items={items} strategy={verticalListSortingStrategy}>
      <Box ref={draggableRef} {...rest}>
        {children}
      </Box>
    </SortableContext>
  );
}

type TempTasks = {
  bucket: {
    id: string;
    name: string;
  };
  tasks:
    | {
        id: string;
        name: string;
        description: string | null;
        end_at: Date | null;
        start_at: Date | null;
        users: {
          user_id: number;
        }[];
      }[]
    | undefined;
}[];

function Kanban(props: { project_id: number }) {
  const { project_id } = props;
  const [newBucketName, setNewBucketName] = useState("");
  const { mutate: addBucket } = useBucketsPost({
    onSuccess: () => {
      setNewBucketName("");
      enqueueSnackbar({
        message: <Typography>Kategori ditambahkan!</Typography>,
        variant: "success",
      });
    },
  });
  const { mutate: updateTask } = useTasksDetailPut({});
  const { data: tasksData, isFetching } = useFormattedTasks({ project_id });

  const [tempTasksData, setTempTasksData] = useState<TempTasks>([]);

  useEffect(() => {
    // PENTING!!! Biar data stale sama data fresh ga kemix.
    // https://github.com/vincentiusvin/skripsi/pull/14#issuecomment-2227337867
    if (isFetching) {
      return;
    }

    const reshaped = tasksData.map((x) => {
      return {
        bucket: {
          ...x.bucket,
          id: `bucket-${x.bucket.id}`,
        },
        tasks: x.tasks?.map((x) => ({
          ...x,
          id: `task-${x.id}`,
        })),
      };
    });

    setTempTasksData(reshaped);
  }, [tasksData, isFetching]);

  const [activeDragID, setActiveDragID] = useState<string | null>();

  function findLocation(cell_id: string) {
    for (const [ctrIdx, container] of tempTasksData.entries()) {
      if (container.bucket.id === cell_id) {
        return { ctrIdx };
      }
      const cellIdx = container.tasks?.findIndex((x) => x.id === cell_id);
      if (cellIdx == undefined || cellIdx === -1) {
        continue;
      }
      return {
        ctrIdx,
        cellIdx,
      };
    }
    return undefined;
  }

  const activeLoc = activeDragID ? findLocation(activeDragID) : undefined;
  const activelyDragged =
    activeLoc && tempTasksData && activeLoc.cellIdx != undefined
      ? tempTasksData[activeLoc.ctrIdx].tasks?.[activeLoc.cellIdx]
      : undefined;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor),
  );

  return (
    <Stack minHeight={"inherit"}>
      <Typography variant="h4" fontWeight={"bold"} textAlign={"center"} marginBottom={2}>
        Tugas
      </Typography>
      <DndContext
        sensors={sensors}
        onDragStart={(x) => setActiveDragID(x.active.id.toString())}
        onDragEnd={({ active }) => {
          setActiveDragID(null);

          if (typeof active.id === "number") {
            return;
          }

          const loc = findLocation(active.id);
          if (loc?.cellIdx == undefined) {
            return;
          }

          const bucket = tempTasksData[loc.ctrIdx].bucket;
          const tasks = tempTasksData[loc.ctrIdx].tasks;
          const task = tasks?.[loc.cellIdx];

          if (bucket == undefined || tasks == undefined || task == undefined) {
            return;
          }

          const bucket_id = extractID(bucket.id);
          const task_id = extractID(task.id);

          if (bucket_id == undefined || task_id == undefined) {
            return;
          }

          const next_task = tasks[loc.cellIdx + 1];
          let next_id: number | null = null;

          if (next_task !== undefined) {
            next_id = extractID(next_task.id) ?? null;
          }

          updateTask({
            bucket_id,
            task_id,
            before_id: next_id,
          });
        }}
        onDragCancel={() => setActiveDragID(null)}
        onDragOver={({ over, active }) => {
          // move between containers...
          setTempTasksData((x) => {
            if (
              over == null ||
              typeof over.id === "number" ||
              typeof active.id === "number" ||
              over.id === active.id // kadang bisa collide sama diri sendiri
            ) {
              return x;
            }
            const overLoc = findLocation(over.id);
            const activeLoc = findLocation(active.id.toString());

            if (overLoc == null || activeLoc == null || activeLoc.cellIdx == undefined) {
              return x;
            }

            const cloned = structuredClone(x);
            const overCtr = cloned[overLoc.ctrIdx];
            const activeCtr = cloned[activeLoc.ctrIdx];
            const activeCell = activeCtr.tasks?.[activeLoc.cellIdx];

            if (activeCell == undefined) {
              return x;
            }

            cloned[activeLoc.ctrIdx].tasks = activeCtr.tasks?.filter((x) => x.id !== active.id);

            const cutIdx = overLoc.cellIdx;
            if (cutIdx != undefined) {
              // insert to array
              cloned[overLoc.ctrIdx].tasks = [
                ...(overCtr.tasks?.slice(0, cutIdx) ?? []),
                activeCell,
                ...(overCtr.tasks?.slice(cutIdx) ?? []),
              ];
            } else {
              // append
              cloned[overLoc.ctrIdx].tasks?.push(activeCell);
            }

            return cloned;
          });
        }}
      >
        <Stack direction={"row"} spacing={5} flexGrow={1} pb={8} overflow={"scroll"} pt={2}>
          {tempTasksData.map(({ bucket, tasks }, i) => (
            <Box key={bucket.id}>
              <Stack spacing={1} width={"250px"} direction={"row"} alignItems={"center"}>
                <Typography
                  flexGrow={1}
                  variant="h6"
                  sx={{
                    wordBreak: "break-word",
                  }}
                >
                  {bucket.name}
                </Typography>
                <EditBucketDialog bucket_id={extractID(bucket.id)!} />
                <AddTaskDialog bucket_id={extractID(bucket.id)!} project_id={project_id} />
              </Stack>
              <Column
                position={"relative"}
                sx={{
                  height: 1,
                  transitionDuration: "250ms",
                  border: 3,
                  borderStyle: "dashed",
                  borderColor: (theme) =>
                    activeDragID
                      ? activeLoc?.ctrIdx === i
                        ? theme.palette.success.main
                        : theme.palette.warning.light
                      : "transparent",
                }}
                id={bucket.id}
                items={tasks?.map((x) => x.id) ?? []}
              >
                <Stack spacing={5} height={1}>
                  {tasks?.map((task) => (
                    <DraggableTask
                      key={task.id}
                      id={task.id}
                      project_id={project_id}
                      isDragged={task.id === activeDragID}
                    ></DraggableTask>
                  ))}
                </Stack>
              </Column>
            </Box>
          ))}
          <Box>
            <DragOverlay>
              {activelyDragged != undefined ? (
                <Task project_id={project_id} task_id={extractID(activelyDragged.id)!}></Task>
              ) : null}
            </DragOverlay>
          </Box>
          <Box>
            <Stack direction={"row"} alignItems={"top"} width={"300px"}>
              <TextField
                label="Tambah Kategori"
                value={newBucketName}
                onChange={(e) => setNewBucketName(e.target.value)}
              ></TextField>
              <Button onClick={() => addBucket({ name: newBucketName, project_id })}>
                <Add />
              </Button>
            </Stack>
          </Box>
        </Stack>
      </DndContext>
    </Stack>
  );
}
function ProjectKanbanPage() {
  const { project_id: id } = useParams();
  const project_id = Number(id);

  return (
    <AuthorizeProjects allowedRoles={["Admin", "Dev"]}>
      <Kanban project_id={project_id} />
    </AuthorizeProjects>
  );
}

export default ProjectKanbanPage;
