import { DragIndicator } from "@mui/icons-material";
import { AvatarGroup, Box, IconButton, Paper, Skeleton, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import UserAvatar from "../../../components/UserAvatar.tsx";
import avatarFallback from "../../../helpers/avatar_fallback.tsx";
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
    <Paper
      {...fullProps}
      sx={{
        width: 300,
        px: 2,
        py: 1,
        opacity: isDragged ? 0.5 : 1,
        overflow: "hidden",
      }}
    >
      <Stack direction="row" alignItems={"center"}>
        <Typography
          flexGrow={1}
          variant="h6"
          sx={{
            wordBreak: "break-word",
          }}
        >
          {task.name}
        </Typography>
        <IconButton
          size="small"
          {...handleProps}
          sx={{
            touchAction: "none",
          }}
        >
          <DragIndicator />
        </IconButton>
        <EditTaskDialog task_id={task_id} project_id={project_id} />
      </Stack>
      <Typography
        variant="caption"
        sx={{
          wordBreak: "break-word",
        }}
      >
        {task.description}
      </Typography>
      <Stack direction="row" alignItems={"center"} mt={1}>
        <Box flexGrow={1}>
          {task.start_at == undefined && task.end_at == undefined ? (
            <Typography variant="caption" color="gray">
              Belum ada tanggal
            </Typography>
          ) : null}
          {task.start_at && (
            <>
              <Typography variant="caption" color="gray">
                Mulai: {dayjs(task.start_at).format("ddd, DD/MM/YY")}
              </Typography>
              <br />
            </>
          )}
          {task.end_at && (
            <Typography variant="caption" color="gray">
              Berakhir: {dayjs(task.end_at).format("ddd, DD/MM/YY")}
            </Typography>
          )}
        </Box>
        <AvatarGroup
          max={3}
          slotProps={{
            surplus: {
              style: {
                width: 32,
                height: 32,
              },
            },
          }}
          renderSurplus={(surplus) => {
            const fallback_img = avatarFallback({
              label: "+" + surplus.toString(),
              seed: task.id,
            });
            return <img src={fallback_img} />;
          }}
        >
          {task.users.map(({ user_id }) => (
            <UserAvatar
              sx={{
                width: 32,
                height: 32,
              }}
              user_id={user_id}
              key={user_id}
            />
          ))}
        </AvatarGroup>
      </Stack>
    </Paper>
  );
}

export default Task;
