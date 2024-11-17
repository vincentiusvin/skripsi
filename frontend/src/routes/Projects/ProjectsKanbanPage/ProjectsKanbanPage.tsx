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
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useEffect } from "react";
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
import {
  KanbanContext,
  findTaskFromBucket,
  useKanbanContext,
  useKanbanReducer,
} from "./context.tsx";

function DraggableTask(props: { task_id: number; project_id: number }) {
  const { project_id, task_id } = props;
  const [kanbanState] = useKanbanContext();
  const { buckets, draggedTask } = kanbanState;
  const { bucket, index } = findTaskFromBucket(buckets, task_id)!;
  const me = bucket.tasks[index];

  const {
    attributes,
    listeners,
    setNodeRef: draggableRef,
    setActivatorNodeRef: activatorRef,
    transform,
    transition,
  } = useSortable({
    id: me.unique_id,
  });

  let handleProps: object | undefined = undefined;

  // dont pass listener if it doesn't need to listen.
  // to avoid rerenders
  // this is so cursed
  if (draggedTask == undefined || draggedTask.task_id === task_id) {
    handleProps = {
      ...listeners,
      ref: activatorRef,
    };
  }

  return (
    <Box
      ref={draggableRef}
      {...attributes}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <Task
        project_id={project_id}
        task_id={task_id}
        isDragged={draggedTask?.task_id === task_id}
        handleProps={handleProps}
      />
    </Box>
  );
}

function Bucket(props: { bucket_id: number; project_id: number }) {
  const { bucket_id, project_id } = props;
  const [kanbanState] = useKanbanContext();
  const { buckets, draggedTask } = kanbanState;

  const me = buckets.find((x) => x.id === bucket_id)!;

  const { setNodeRef: draggableRef } = useDroppable({
    id: me.unique_id,
  });

  const items = me.tasks.map((x) => x.unique_id);

  let dragState: "hover" | "active" | "rest" = "rest";
  if (draggedTask !== undefined) {
    if (draggedTask.task_bucket === bucket_id) {
      dragState = "hover";
    } else {
      dragState = "active";
    }
  }

  return (
    <SortableContext items={items} strategy={verticalListSortingStrategy}>
      <Box
        ref={draggableRef}
        position={"relative"}
        sx={{
          height: 1,
          transitionDuration: "250ms",
          border: 3,
          borderStyle: "dashed",
          borderColor: (theme) =>
            dragState === "hover"
              ? theme.palette.success.main
              : dragState === "active"
              ? theme.palette.warning.light
              : "transparent",
        }}
      >
        <Stack spacing={5} height={1} width={300}>
          {me.tasks.map((task) => (
            <DraggableTask key={task.id} task_id={task.id} project_id={project_id}></DraggableTask>
          ))}
        </Stack>
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
    <KanbanContext.Provider value={[kanbanState, dispatch]}>
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
              before_id: nextTaskID ?? null,
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
            const isBelowOverItem =
              active.rect.current.translated &&
              active.rect.current.translated.top > over.rect.top + over.rect.height;

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
                below: !!isBelowOverItem,
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
                <Bucket bucket_id={bucket.id} project_id={project_id} />
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
    </KanbanContext.Provider>
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
