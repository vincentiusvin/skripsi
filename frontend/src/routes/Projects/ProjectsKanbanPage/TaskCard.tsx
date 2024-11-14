import { DragIndicator } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Skeleton,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useTasksDetailGet } from "../../../queries/task_hooks.ts";
import EditTaskDialog from "./EditTaskDialog.tsx";

function Task(props: {
  task_id: number;
  project_id: number;
  isDragged?: boolean;
  fullProps?: object;
  handleProps?: object;
}) {
  const { project_id, task_id, isDragged, fullProps, handleProps } = props;

  const { data: task } = useTasksDetailGet({ task_id });

  if (task == undefined) {
    return <Skeleton />;
  }

  return (
    <Card
      {...fullProps}
      sx={{
        opacity: isDragged ? 0.5 : 1,
        display: "flex",
        alignItems: "center",
        paddingX: 1,
      }}
    >
      <IconButton
        size="small"
        {...handleProps}
        sx={{
          touchAction: "none",
        }}
      >
        <DragIndicator />
      </IconButton>
      <Box flexGrow={1}>
        <CardHeader
          action={
            <>
              <EditTaskDialog task_id={task_id} project_id={project_id} />
            </>
          }
          sx={{
            wordBreak: "break-word",
          }}
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
      </Box>
    </Card>
  );
}

export default Task;
