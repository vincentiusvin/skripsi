import { MoreVert } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import {
  useBucketsDetailDelete,
  useBucketsDetailGet,
  useBucketsDetailPut,
  useTasksGet,
} from "../../../queries/task_hooks.ts";

function EditBucketDialog(props: { bucket_id: number }) {
  const { bucket_id } = props;
  const [active, setActive] = useState(false);
  const { data: bucket } = useBucketsDetailGet({ bucket_id });
  const { data: tasks } = useTasksGet({
    bucket_id,
  });
  const [newName, setNewName] = useState<string | undefined>();
  const [promptDeletion, setPromptDeletion] = useState(false);
  const { mutate: editBucket } = useBucketsDetailPut({
    bucket_id,
    onSuccess: () => {
      reset();
    },
  });
  const { mutate: _deleteBucket } = useBucketsDetailDelete({
    bucket_id,
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Kategori dihapus!</Typography>,
        variant: "success",
      });
    },
  });

  function reset() {
    setNewName(undefined);
    setActive(false);
    setPromptDeletion(false);
  }

  function deleteBucket() {
    if (bucket == undefined || tasks == undefined) {
      return;
    }

    if (tasks.length > 0) {
      setPromptDeletion(true);
    } else {
      _deleteBucket();
    }
  }

  if (!bucket) {
    return <Skeleton />;
  }

  return (
    <>
      <Dialog open={active} onClose={() => reset()}>
        <DialogTitle>Edit Kategori</DialogTitle>
        {promptDeletion ? (
          <Alert severity="warning">
            <Typography>Yakin ingin menghapus kelompok tugas ini?</Typography>
            <Typography>Anda memiliki {tasks?.length} tugas yang akan hilang.</Typography>
          </Alert>
        ) : null}
        <DialogContent>
          <Box my={1}>
            <TextField
              label="Nama"
              value={newName ?? bucket.name}
              required
              onChange={(x) => setNewName(x.target.value)}
            ></TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          {promptDeletion ? (
            <Button
              onClick={() => {
                _deleteBucket();
              }}
              color="error"
            >
              Ya, hapus kelompok tugas
            </Button>
          ) : (
            <Button
              onClick={() => {
                deleteBucket();
              }}
            >
              Hapus Kelompok Tugas
            </Button>
          )}
          <Button
            onClick={() => {
              editBucket({
                name: newName,
              });
            }}
          >
            Simpan Nama
          </Button>
        </DialogActions>
      </Dialog>
      <IconButton onClick={() => setActive(true)}>
        <MoreVert />
      </IconButton>
    </>
  );
}

export default EditBucketDialog;
