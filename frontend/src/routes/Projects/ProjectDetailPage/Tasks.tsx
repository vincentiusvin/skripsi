import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
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
import { useState } from "react";
import {
  useProjectsDetailBucketsGet,
  useProjectsDetailBucketsPost,
} from "../../../queries/project_hooks";
import {
  useBucketsDetailTasksGet,
  useBucketsDetailTasksPost,
  useTasksDetailPut,
} from "../../../queries/task_hooks.ts";

function Task(props: {
  task_id: number;
  name: string;
  description?: string;
  start_at?: Dayjs;
  end_at?: Dayjs;
}) {
  const { task_id, name, description, start_at, end_at } = props;
  const {
    attributes,
    listeners,
    setNodeRef: draggableRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `task-${task_id}`,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <Card
      variant="elevation"
      style={style}
      {...listeners}
      {...attributes}
      ref={draggableRef}
      sx={{
        zIndex: isDragging ? 3 : 2,
      }}
    >
      <CardActionArea>
        <CardHeader
          title={
            <Typography variant="h5" fontWeight={"bold"}>
              {name}
            </Typography>
          }
          subheader={<Typography variant="body1">{description}</Typography>}
        />
        <CardContent>
          {start_at && (
            <>
              <Typography variant="caption">Mulai: {start_at.format("ddd, DD/MM/YY")}</Typography>
              <br />
            </>
          )}
          {end_at && (
            <Typography variant="caption">Berakhir: {end_at.format("ddd, DD/MM/YY")}</Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function Bucket(props: {
  bucket_id: number;
  name: string;
  setSelectedBucketEdit: (x: number) => void;
  outline?: boolean;
}) {
  const { bucket_id, name, setSelectedBucketEdit, outline } = props;
  const { data: tasks } = useBucketsDetailTasksGet({ bucket_id });
  const { setNodeRef: droppableRef, isOver } = useDroppable({
    id: `bucket-${bucket_id}`,
  });

  return (
    <Box
      ref={droppableRef}
      position={"relative"}
      sx={{
        transitionDuration: "100ms",
        border: 3,
        borderStyle: "dashed",
        borderColor: outline ? (isOver ? "green" : "white") : "transparent",
      }}
    >
      {name}
      <Button onClick={() => setSelectedBucketEdit(bucket_id)}>
        <Add />
      </Button>
      <Stack spacing={5} width={"250px"} height={1}>
        {tasks?.map((x, i) => (
          <Task
            key={i}
            task_id={x.id}
            name={x.name}
            description={x.description ?? undefined}
            start_at={x.start_at ? dayjs(x.start_at) : undefined}
            end_at={x.end_at ? dayjs(x.end_at) : undefined}
          />
        ))}
      </Stack>
    </Box>
  );
}

function Tasks(props: { project_id: number }) {
  const { project_id } = props;
  const { data: buckets } = useProjectsDetailBucketsGet({ project_id });
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
  const [bucketName, setBucketName] = useState("");

  // undef: gak ada yang dipilih
  // number: lagi ngedit bucket itu
  const [selectedBucketEdit, setSelectedBucketEdit] = useState<null | number>(null);
  const [taskName, setTaskName] = useState<null | string>(null);
  const [taskDescription, setTaskDescription] = useState<null | string>(null);
  const [taskStartAt, setTaskStartAt] = useState<null | Dayjs>(null);
  const [taskEndAt, setTaskEndAt] = useState<null | Dayjs>(null);

  const { mutate: updateTask } = useTasksDetailPut({});

  const [dragging, setDragging] = useState(false);

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
          onDragStart={() => {
            setDragging(true);
          }}
          onDragCancel={() => {
            setDragging(false);
          }}
          onDragEnd={(x) => {
            setDragging(false);
            const [, dropped_bucket_id] = x.over?.id.toString().split("-") || [];
            const [, dragged_task_id] = x.active?.id.toString().split("-") || [];
            if (dropped_bucket_id == undefined || dragged_task_id == undefined) {
              return;
            }

            const bucket_id = Number(dropped_bucket_id);
            const task_id = Number(dragged_task_id);

            if (Number.isNaN(bucket_id) || Number.isNaN(task_id)) {
              return;
            }

            updateTask({
              task_id: task_id,
              bucket_id: bucket_id,
            });
          }}
        >
          {buckets?.map((x, i) => (
            <Bucket
              outline={dragging}
              bucket_id={x.id}
              name={x.name}
              setSelectedBucketEdit={(x) => setSelectedBucketEdit(x)}
              key={i}
            ></Bucket>
          ))}
          <Box>
            <Stack direction={"row"} alignItems={"top"}>
              <TextField
                label="Add Bucket"
                value={bucketName}
                onChange={(e) => setBucketName(e.target.value)}
              ></TextField>
              <Button onClick={() => addBucket({ name: bucketName })}>
                <Add />
              </Button>
            </Stack>
          </Box>
        </DndContext>
      </Stack>
    </Stack>
  );
}

export default Tasks;
