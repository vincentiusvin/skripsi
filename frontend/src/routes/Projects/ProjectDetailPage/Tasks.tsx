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
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { enqueueSnackbar } from "notistack";
import { ReactNode, useEffect, useState } from "react";
import { useProjectsDetailBucketsPost } from "../../../queries/project_hooks";
import {
  useBucketsDetailTasksPost,
  useFormattedTasks,
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
          id: number;
          name: string;
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
  const { mutate: addTask } = useBucketsDetailTasksPost({
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Task created!</Typography>,
        variant: "success",
      });
      setSelectedBucketEdit(null);
    },
  });
  const { mutate: updateTask } = useTasksDetailPut({});
  const { data: tasksData } = useFormattedTasks({ project_id });

  const [tempTasksData, setTempTasksData] = useState<TempTasks>([]);

  useEffect(() => {
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
  }, [tasksData]);

  const [newBucketName, setNewBucketName] = useState("");
  // undef: gak ada yang dipilih
  // number: lagi ngedit bucket itu
  const [selectedBucketEdit, setSelectedBucketEdit] = useState<null | number>(null);
  const [taskName, setTaskName] = useState<null | string>(null);
  const [taskDescription, setTaskDescription] = useState<null | string>(null);
  const [taskStartAt, setTaskStartAt] = useState<null | Dayjs>(null);
  const [taskEndAt, setTaskEndAt] = useState<null | Dayjs>(null);

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
    activeLoc && tempTasksData
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
    <Stack height={"100%"}>
      {selectedBucketEdit && (
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
                if (taskName == null) {
                  return;
                }
                addTask({
                  name: taskName,
                  bucket_id: selectedBucketEdit,
                  description: taskDescription ?? undefined,
                  start_at: taskStartAt?.toDate(),
                  end_at: taskEndAt?.toDate(),
                });
              }}
            >
              Create Task
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <Stack direction={"row"} spacing={5} flexGrow={1} pb={8}>
        <DndContext
          sensors={sensors}
          onDragStart={(x) => setActiveDragID(x.active.id.toString())}
          onDragEnd={() => setActiveDragID(null)}
          onDragCancel={() => setActiveDragID(null)}
          onDragOver={({ over, active }) => {
            // move between containers...
            setTempTasksData((x) => {
              if (over == null || typeof over.id === "number" || typeof active.id === "number") {
                return x;
              }
              const overLoc = findLocation(over.id);
              const activeLoc = findLocation(active.id.toString());

              if (
                overLoc == null ||
                activeLoc == null ||
                activeLoc.ctrIdx == overLoc.ctrIdx ||
                activeLoc.cellIdx == undefined
              ) {
                return x;
              }

              const cloned = structuredClone(x);
              const overCtr = cloned[overLoc.ctrIdx]!;
              const activeCtr = cloned[activeLoc.ctrIdx]!;
              const activeCell = activeCtr.tasks?.[activeLoc.cellIdx]!;

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

              cloned[activeLoc.ctrIdx].tasks = activeCtr.tasks?.filter((x) => x.id !== active.id);
              return cloned;
            });
          }}
        >
          {tempTasksData.map(({ bucket, tasks }, i) => (
            <Box key={i}>
              <Typography display={"inline"} variant="h6">
                {bucket.name}
              </Typography>
              <Button onClick={() => setSelectedBucketEdit(extractID(bucket.id) ?? null)}>
                <Add />
              </Button>
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
                key={i}
              >
                <Stack spacing={5} width={"250px"} height={1}>
                  {tasks?.map((task, i) => (
                    <Cell key={i} id={task.id}>
                      <Card
                        sx={{
                          opacity: task.id === activeDragID ? 0.5 : 1,
                        }}
                      >
                        <CardActionArea>
                          <CardHeader
                            title={
                              <Typography variant="h5" fontWeight={"bold"}>
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
                        </CardActionArea>
                      </Card>
                    </Cell>
                  ))}
                </Stack>
              </Column>
            </Box>
          ))}
          <DragOverlay>
            {activelyDragged ? (
              <Card>
                <CardActionArea>
                  <CardHeader
                    title={
                      <Typography variant="h5" fontWeight={"bold"}>
                        {activelyDragged.name}
                      </Typography>
                    }
                    subheader={
                      <Typography variant="body1">{activelyDragged.description}</Typography>
                    }
                  />
                  <CardContent>
                    {activelyDragged.start_at && (
                      <>
                        <Typography variant="caption">
                          Mulai: {dayjs(activelyDragged.start_at).format("ddd, DD/MM/YY")}
                        </Typography>
                        <br />
                      </>
                    )}
                    {activelyDragged.end_at && (
                      <Typography variant="caption">
                        Berakhir: {dayjs(activelyDragged.end_at).format("ddd, DD/MM/YY")}
                      </Typography>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            ) : null}
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
