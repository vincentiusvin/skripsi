import { MoreVert } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  TextField,
} from "@mui/material";
import { useState } from "react";
import {
  useBucketsDetailDelete,
  useBucketsDetailGet,
  useBucketsDetailPut,
} from "../../../queries/task_hooks.ts";

function EditBucketDialog(props: { bucket_id: number }) {
  const { bucket_id } = props;
  const [active, setActive] = useState(false);
  const { data: bucket } = useBucketsDetailGet({ bucket_id });
  const [newName, setNewName] = useState<string | undefined>();
  const { mutate: editBucket } = useBucketsDetailPut({
    bucket_id,
    onSuccess: () => {
      reset();
    },
  });
  const { mutate: deleteBucket } = useBucketsDetailDelete({ bucket_id });

  function reset() {
    setNewName(undefined);
    setActive(false);
  }

  if (!bucket) {
    return <Skeleton />;
  }

  return (
    <>
      <Dialog open={active} onClose={() => reset()}>
        <DialogTitle>Edit Kategori</DialogTitle>
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
          <Button
            onClick={() => {
              deleteBucket();
            }}
          >
            Hapus Kelompok Tugas
          </Button>
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
