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
import { Add, MoreVert } from "@mui/icons-material";
import {
  Box,
  BoxProps,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { enqueueSnackbar } from "notistack";
import { ReactNode, useEffect, useState } from "react";
import {
  useBucketsDetailDelete,
  useBucketsDetailGet,
  useBucketsDetailPut,
  useBucketsDetailTasksPost,
  useFormattedTasks,
  useProjectsDetailBucketsPost,
  useTasksDetailDelete,
  useTasksDetailGet,
  useTasksDetailPut,
} from "../../../queries/task_hooks.ts";

function extractID(str: string): number | undefined {
  const id = str.split("-")[1];
  return id != undefined ? Number(id) : undefined;
}

function Cell(props: { id: string; children: ReactNode }) {
  const { id, children } = props;
  const {
    attributes,
    listeners,
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

  return (
    <Box style={style} {...listeners} {...attributes} ref={draggableRef}>
      {children}
    </Box>
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

function EditBucketDialog(props: { bucket_id: number }) {
  const { bucket_id } = props;
  const [active, setActive] = useState(false);
  const { data: bucket } = useBucketsDetailGet({ bucket_id });
  const [newName, setNewName] = useState<string | undefined>();
  const { mutate: editBucket } = useBucketsDetailPut({ bucket_id });
  const { mutate: deleteBucket } = useBucketsDetailDelete({ bucket_id });

  if (!bucket) {
    return <Skeleton />;
  }

  return (
    <>
      <Dialog open={active} onClose={() => setActive(false)}>
        <DialogTitle>Edit task</DialogTitle>
        <DialogContent>
          <TextField
            label="Insert name"
            defaultValue={bucket.name}
            onChange={(x) => setNewName(x.target.value)}
          ></TextField>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              deleteBucket();
              setActive(false);
            }}
          >
            Delete Bucket
          </Button>
          <Button
            onClick={() => {
              if (newName) {
                editBucket({
                  name: newName,
                });
              }
              setActive(false);
            }}
          >
            Edit Bucket
          </Button>
        </DialogActions>
      </Dialog>
      <Box maxWidth={256}>
        <Typography
          display={"inline"}
          variant="h6"
          sx={{
            wordBreak: "break-word",
          }}
        >
          {bucket.name}
        </Typography>
        <IconButton onClick={() => setActive(true)}>
          <MoreVert />
        </IconButton>
      </Box>
    </>
  );
}

function Task(props: { task_id: number; isDragged?: boolean }) {
  const { task_id, isDragged } = props;
  const { data: task } = useTasksDetailGet({ task_id });

  if (task == undefined) {
    return <Skeleton />;
  }

  return (
    <Card
      sx={{
        opacity: isDragged ? 0.5 : 1,
      }}
    >
      <CardHeader
        action={<EditTaskDialog task_id={task_id} />}
        title={
          <Typography
            variant="h5"
            fontWeight={"bold"}
            sx={{
              wordBreak: "break-word",
            }}
          >
            {task.name}
          </Typography>
        }
        subheader={<Typography variant="body1">{task.description}</Typography>}
      />
      <CardContent>
        {task.start_at && (
          <>
            <Typography variant="caption">
              Mulai: {dayjs(task.start_at).format("ddd, DD/MM/YY")}
            </Typography>
            <br />
          </>
        )}
        {task.end_at && (
          <Typography variant="caption">
            Berakhir: {dayjs(task.end_at).format("ddd, DD/MM/YY")}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function AddNewTaskDialog(props: { bucket_id: number }) {
  const { bucket_id } = props;

  // undef: gak ada yang dipilih
  // number: lagi ngedit bucket itu
  const [selectedBucketEdit, setSelectedBucketEdit] = useState<null | number>(null);
  const [taskName, setTaskName] = useState<string>("");
  const [taskDescription, setTaskDescription] = useState<null | string>(null);
  const [taskStartAt, setTaskStartAt] = useState<null | Dayjs>(null);
  const [taskEndAt, setTaskEndAt] = useState<null | Dayjs>(null);

  const { mutate: addTask } = useBucketsDetailTasksPost({
    bucket_id,
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Task created!</Typography>,
        variant: "success",
      });
      setSelectedBucketEdit(null);
    },
  });

  return (
    <>
      <IconButton onClick={() => setSelectedBucketEdit(bucket_id)}>
        <Add />
      </IconButton>
      {selectedBucketEdit != null && (
        <Dialog open={selectedBucketEdit != null} onClose={() => setSelectedBucketEdit(null)}>
          <DialogTitle>Add new task</DialogTitle>
          <DialogContent>
            <TextField fullWidth onChange={(e) => setTaskName(e.target.value)} label="Task name" />
            <TextField
              fullWidth
              onChange={(e) => setTaskDescription(e.target.value)}
              label="Task description"
            />
            <DatePicker onAccept={(x) => setTaskStartAt(x)} label="Start At"></DatePicker>
            <DatePicker onAccept={(x) => setTaskEndAt(x)} label="End At"></DatePicker>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                addTask({
                  name: taskName,
                  description: taskDescription ?? undefined,
                  start_at: taskStartAt?.toISOString(),
                  end_at: taskEndAt?.toISOString(),
                });
              }}
            >
              Create Task
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}

function EditTaskDialog(props: { task_id: number }) {
  const { task_id } = props;

  // undef: gak ada yang dipilih
  // number: lagi ngedit bucket itu
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [taskName, setTaskName] = useState<string | null>();
  const [taskDescription, setTaskDescription] = useState<null | string>();
  const [taskStartAt, setTaskStartAt] = useState<null | Dayjs>();
  const [taskEndAt, setTaskEndAt] = useState<null | Dayjs>();

  const { data: task } = useTasksDetailGet({ task_id });

  const { mutate: editTask } = useTasksDetailPut({
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Task modified!</Typography>,
        variant: "success",
      });
      setDialogOpen(false);
    },
  });

  const { mutate: deleteTask } = useTasksDetailDelete({
    task_id,
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Task deleted!</Typography>,
        variant: "success",
      });
      setDialogOpen(false);
    },
  });

  return (
    <>
      <IconButton
        onClick={() => {
          setDialogOpen(true);
        }}
      >
        <MoreVert />
      </IconButton>
      {dialogOpen && task != null && (
        <Dialog open={dialogOpen != null} onClose={() => setDialogOpen(false)}>
          <DialogTitle>Edit task</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              onChange={(e) => setTaskName(e.target.value)}
              label="Task name"
              defaultValue={task.name}
            />
            <TextField
              fullWidth
              onChange={(e) => setTaskDescription(e.target.value)}
              label="Task description"
              defaultValue={task.description}
            />
            <DatePicker
              defaultValue={task.start_at != null ? dayjs(task.start_at) : undefined}
              onAccept={(x) => setTaskStartAt(x)}
              label="Start At"
            ></DatePicker>
            <DatePicker
              defaultValue={task.end_at != null ? dayjs(task.start_at) : undefined}
              onAccept={(x) => setTaskEndAt(x)}
              label="End At"
            ></DatePicker>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                deleteTask();
              }}
            >
              Delete Task
            </Button>
            <Button
              onClick={() => {
                editTask({
                  task_id,
                  name: taskName ?? undefined,
                  description: taskDescription ?? undefined,
                  start_at: taskStartAt?.toISOString(),
                  end_at: taskEndAt?.toISOString(),
                });
              }}
            >
              Edit Task
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
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
  const { mutate: addBucket } = useProjectsDetailBucketsPost({
    project_id: project_id,
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Task created!</Typography>,
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

  const [newBucketName, setNewBucketName] = useState("");
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
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  );

  return (
    <Stack height={"100%"} width={"100%"} overflow={"scroll"}>
      <Stack direction={"row"} spacing={5} flexGrow={1} pb={8}>
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
            let next_id: number | undefined = undefined;

            if (next_task !== undefined) {
              next_id = extractID(next_task.id);
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
          {tempTasksData.map(({ bucket, tasks }, i) => (
            <Box key={bucket.id}>
              <EditBucketDialog bucket_id={extractID(bucket.id)!} />
              <AddNewTaskDialog bucket_id={extractID(bucket.id)!} />
              <Column
                position={"relative"}
                sx={{
                  height: 1,
                  transitionDuration: "250ms",
                  border: 3,
                  borderStyle: "dashed",
                  borderColor: activeDragID
                    ? activeLoc?.ctrIdx === i
                      ? "green"
                      : "white"
                    : "transparent",
                }}
                id={bucket.id}
                items={tasks?.map((x) => x.id) ?? []}
              >
                <Stack spacing={5} width={"250px"} height={1}>
                  {tasks?.map((task) => (
                    <Cell key={task.id} id={task.id}>
                      <Task
                        isDragged={task.id === activeDragID}
                        task_id={extractID(task.id)!}
                      ></Task>
                    </Cell>
                  ))}
                </Stack>
              </Column>
            </Box>
          ))}
          <DragOverlay>
            {activelyDragged ? <Task task_id={extractID(activelyDragged.id)!}></Task> : null}
          </DragOverlay>
          <Box>
            <Stack direction={"row"} alignItems={"top"}>
              <TextField
                label="Add Bucket"
                value={newBucketName}
                onChange={(e) => setNewBucketName(e.target.value)}
              ></TextField>
              <Button onClick={() => addBucket({ name: newBucketName })}>
                <Add />
              </Button>
            </Stack>
          </Box>
        </DndContext>
      </Stack>
    </Stack>
  );
}

export default Kanban;
