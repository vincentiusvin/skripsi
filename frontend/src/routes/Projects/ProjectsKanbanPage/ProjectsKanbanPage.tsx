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
import { Alert, Box, BoxProps, Button, Skeleton, Stack, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { ReactNode, useEffect } from "react";
import { useParams } from "wouter";
import {
  useFormattedTasks,
  useProjectBucketsReset,
  useTasksDetailPut,
} from "../../../queries/task_hooks.ts";
import AuthorizeProjects from "../components/AuthorizeProjects.tsx";
import AddBucket from "./AddBucket.tsx";
import AddTaskDialog from "./AddTaskDialog.tsx";
import EditBucketDialog from "./EditBucketDialog.tsx";
import Task from "./TaskCard.tsx";
import { findTaskFromBucket, useKanbanReducer } from "./context.tsx";

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

function Kanban(props: { project_id: number }) {
  const { project_id } = props;
  const { mutate: updateTask } = useTasksDetailPut({});
  const { data: tasksData, isFetching } = useFormattedTasks({ project_id });

  const [kanbanState, dispatch] = useKanbanReducer();

  const { mutate: resetBuckets } = useProjectBucketsReset({
    project_id,
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Kelompok tugas berhasil ditambahkan!</Typography>,
        variant: "success",
      });
    },
  });

  useEffect(() => {
    // PENTING!!! Biar data stale sama data fresh ga kemix.
    // https://github.com/vincentiusvin/skripsi/pull/14#issuecomment-2227337867
    if (isFetching) {
      return;
    }

    const reshaped = tasksData.map((x) => {
      return {
        ...x.bucket,
        unique_id: "bucket-" + x.bucket.id,
        tasks:
          x.tasks?.map((x) => ({
            ...x,
            unique_id: "task-" + x.id,
          })) ?? [],
      };
    });

    dispatch({
      type: "replace",
      data: {
        buckets: reshaped,
      },
    });
  }, [tasksData, isFetching, dispatch]);

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
      {tasksData.length === 0 ? (
        <Alert
          severity="info"
          action={
            <Button
              size="small"
              color="inherit"
              sx={{
                margin: "auto",
              }}
              onClick={() => {
                resetBuckets();
              }}
            >
              Pasang Template
            </Button>
          }
        >
          Proyek ini belum memiliki kategori tugas. Anda dapat menggunakan template default dengan
          mengklik tombol di samping.
        </Alert>
      ) : null}
      <DndContext
        sensors={sensors}
        onDragStart={({ active }) => {
          if (typeof active.id == "number") {
            return;
          }

          const [activeType, _activeId] = active.id.split("-");
          const activeId = Number(_activeId);
          if (activeType !== "task" || Number.isNaN(activeId)) {
            return;
          }

          dispatch({
            type: "lift",
            task_id: activeId,
          });
        }}
        onDragEnd={({ active }) => {
          if (typeof active.id === "number") {
            return;
          }

          const [activeType, _activeId] = active.id.split("-");
          const activeId = Number(_activeId);
          if (activeType !== "task" || Number.isNaN(activeId)) {
            return;
          }

          const foundTask = findTaskFromBucket(kanbanState.buckets, activeId);
          if (foundTask == undefined) {
            return;
          }

          const nextTaskID: number | undefined = foundTask.bucket.tasks[foundTask.index + 1]?.id;

          updateTask({
            bucket_id: foundTask.bucket.id,
            task_id: activeId,
            before_id: nextTaskID,
          });
        }}
        onDragCancel={() => {
          dispatch({
            type: "unlift",
          });
        }}
        onDragOver={({ over, active }) => {
          if (
            over == null ||
            typeof over.id === "number" ||
            typeof active.id === "number" ||
            over.id === active.id // kadang bisa collide sama diri sendiri
          ) {
            return;
          }
          const [activeType, _activeId] = active.id.split("-");
          const [overType, _overId] = over.id.split("-");
          const activeId = Number(_activeId);
          const overId = Number(_overId);

          if (activeType !== "task" || Number.isNaN(activeId) || Number.isNaN(overId)) {
            return;
          }

          if (overType === "bucket") {
            dispatch({
              type: "move-over-container",
              over_container_id: overId,
              task_id: activeId,
            });
          } else {
            dispatch({
              type: "move-over-task",
              over_task_id: overId,
              task_id: activeId,
            });
          }
        }}
      >
        <Stack direction={"row"} spacing={5} flexGrow={1} pb={8} overflow={"scroll"} pt={2}>
          {kanbanState.buckets.map((bucket) => (
            <Box key={bucket.id}>
              <Stack spacing={1} direction={"row"} alignItems={"center"}>
                <Typography
                  flexGrow={1}
                  variant="h6"
                  sx={{
                    wordBreak: "break-word",
                  }}
                >
                  {bucket.name}
                </Typography>
                <EditBucketDialog bucket_id={bucket.id} />
                <AddTaskDialog bucket_id={bucket.id} project_id={project_id} />
              </Stack>
              <Column
                position={"relative"}
                sx={{
                  height: 1,
                  transitionDuration: "250ms",
                  border: 3,
                  borderStyle: "dashed",
                  borderColor: (theme) =>
                    kanbanState.draggedTask != undefined
                      ? kanbanState.draggedTask.task_bucket === bucket.id
                        ? theme.palette.success.main
                        : theme.palette.warning.light
                      : "transparent",
                }}
                id={bucket.unique_id}
                items={bucket.tasks.map((x) => x.unique_id) ?? []}
              >
                <Stack spacing={5} height={1}>
                  {bucket.tasks.map((task) => (
                    <DraggableTask
                      key={task.id}
                      id={task.unique_id}
                      project_id={project_id}
                      isDragged={task.id === kanbanState.draggedTask?.task_id}
                    ></DraggableTask>
                  ))}
                </Stack>
              </Column>
            </Box>
          ))}
          <Box>
            <DragOverlay>
              {kanbanState.draggedTask != undefined ? (
                <Task project_id={project_id} task_id={kanbanState.draggedTask.task_id}></Task>
              ) : null}
            </DragOverlay>
          </Box>
          <Box>
            <AddBucket project_id={project_id} />
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
