import { MoreVert } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import UserSelect from "../../../components/UserSelect.tsx";
import { handleOptionalStringUpdate } from "../../../helpers/misc.ts";
import { useProjectsDetailGet } from "../../../queries/project_hooks.ts";
import {
  useTasksDetailDelete,
  useTasksDetailGet,
  useTasksDetailPut,
} from "../../../queries/task_hooks.ts";

function EditTaskDialog(props: { task_id: number; project_id: number }) {
  const { task_id, project_id } = props;

  // undef: gak ada yang dipilih
  // number: lagi ngedit bucket itu
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [taskName, setTaskName] = useState<string | undefined>();
  const [taskDescription, setTaskDescription] = useState<undefined | string>();
  const [taskStartAt, setTaskStartAt] = useState<undefined | null | Dayjs>();
  const [taskEndAt, setTaskEndAt] = useState<undefined | null | Dayjs>();
  const [taskAssign, setTaskAssign] = useState<undefined | number[]>();
  const { data: project_data } = useProjectsDetailGet({
    project_id,
  });

  const { data: task } = useTasksDetailGet({ task_id });

  const { mutate: editTask } = useTasksDetailPut({
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Tugas berhasil diedit!</Typography>,
        variant: "success",
      });
      setDialogOpen(false);
    },
  });

  const { mutate: deleteTask } = useTasksDetailDelete({
    task_id,
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Tugas berhasil dihapus!</Typography>,
        variant: "success",
      });
      setDialogOpen(false);
    },
  });

  const project_members = project_data?.project_members
    .filter((x) => x.role === "Admin" || x.role === "Dev")
    .map((x) => x.user_id);

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
          <DialogTitle>Edit Tugas</DialogTitle>
          <DialogContent>
            <Stack spacing={2} my={2}>
              <TextField
                fullWidth
                onChange={(e) => setTaskName(e.target.value)}
                required
                label="Judul"
                value={taskName ?? task.name}
              />
              <TextField
                fullWidth
                onChange={(e) => setTaskDescription(e.target.value)}
                label="Deskripsi"
                value={taskDescription ?? task.description ?? ""}
              />
              <DatePicker
                onChange={(x) => setTaskStartAt(x)}
                label="Mulai"
                value={taskStartAt ?? task.start_at != null ? dayjs(task.start_at) : null}
              ></DatePicker>
              <DatePicker
                value={taskEndAt ?? task.end_at != null ? dayjs(task.end_at) : null}
                onChange={(x) => setTaskEndAt(x)}
                label="Selesai"
              ></DatePicker>
              {project_members != undefined ? (
                <UserSelect
                  label="Penanggung Jawab"
                  current_users={taskAssign ?? task.users.map((x) => x.user_id)}
                  allowed_users={project_members}
                  onChange={(x) => {
                    setTaskAssign(x);
                  }}
                />
              ) : null}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                deleteTask();
              }}
            >
              Hapus
            </Button>
            <Button
              onClick={() => {
                editTask({
                  task_id,
                  name: taskName,
                  description: handleOptionalStringUpdate(taskDescription),
                  start_at: taskStartAt != undefined ? taskStartAt.toISOString() : taskStartAt,
                  end_at: taskEndAt != undefined ? taskEndAt.toISOString() : taskEndAt,
                  users: taskAssign,
                });
              }}
            >
              Simpan
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
export default EditTaskDialog;
