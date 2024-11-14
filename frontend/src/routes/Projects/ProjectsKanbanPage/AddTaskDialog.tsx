import { Add } from "@mui/icons-material";
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
import { Dayjs } from "dayjs";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import UserSelect from "../../../components/UserSelect.tsx";
import { handleOptionalStringCreation } from "../../../helpers/misc.ts";
import { useProjectsDetailGet } from "../../../queries/project_hooks.ts";
import { useTasksPost } from "../../../queries/task_hooks.ts";

function AddTaskDialog(props: { bucket_id: number; project_id: number }) {
  const { bucket_id, project_id } = props;

  // undef: gak ada yang dipilih
  // number: lagi ngedit bucket itu
  const [selectedBucketEdit, setSelectedBucketEdit] = useState<undefined | number>();
  const [taskName, setTaskName] = useState<string>("");
  const [taskDescription, setTaskDescription] = useState<undefined | string>();
  const [taskStartAt, setTaskStartAt] = useState<undefined | Dayjs>();
  const [taskEndAt, setTaskEndAt] = useState<undefined | Dayjs>();
  const [taskAssign, setTaskAssign] = useState<number[] | undefined>();

  function reset() {
    setTaskName("");
    setTaskDescription(undefined);
    setTaskDescription(undefined);
    setTaskStartAt(undefined);
    setTaskEndAt(undefined);
    setTaskAssign(undefined);
    setSelectedBucketEdit(undefined);
  }

  const { mutate: addTask } = useTasksPost({
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Tugas berhasil ditambahkan!</Typography>,
        variant: "success",
      });
      reset();
    },
  });
  const { data: project_data } = useProjectsDetailGet({
    project_id,
  });

  const project_members = project_data?.project_members
    .filter((x) => x.role === "Admin" || x.role === "Dev")
    .map((x) => x.user_id);

  return (
    <>
      <IconButton onClick={() => setSelectedBucketEdit(bucket_id)}>
        <Add />
      </IconButton>
      {selectedBucketEdit != undefined && (
        <Dialog open={selectedBucketEdit != undefined} onClose={reset}>
          <DialogTitle>Tambah tugas baru</DialogTitle>
          <DialogContent>
            <Stack spacing={2} my={2}>
              <TextField
                fullWidth
                required
                onChange={(e) => setTaskName(e.target.value)}
                label="Judul"
              />
              <TextField
                fullWidth
                onChange={(e) => setTaskDescription(e.target.value)}
                label="Deskripsi"
              />
              <DatePicker
                onChange={(x) => setTaskStartAt(x ?? undefined)}
                label="Mulai"
              ></DatePicker>
              <DatePicker
                onChange={(x) => setTaskEndAt(x ?? undefined)}
                label="Selesai"
              ></DatePicker>
              {project_members != undefined ? (
                <UserSelect
                  current_users={taskAssign ?? []}
                  allowed_users={project_members}
                  onChange={(x) => {
                    setTaskAssign(x);
                  }}
                  label="Atur Penanggung Jawab"
                />
              ) : null}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                addTask({
                  bucket_id,
                  name: taskName,
                  description: handleOptionalStringCreation(taskDescription),
                  start_at: taskStartAt?.toISOString(),
                  end_at: taskEndAt?.toISOString(),
                  users: taskAssign,
                });
              }}
            >
              Tambah
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
export default AddTaskDialog;
