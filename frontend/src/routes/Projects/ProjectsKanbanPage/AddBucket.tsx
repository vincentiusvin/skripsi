import { Add } from "@mui/icons-material";
import { Button, Stack, TextField, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useBucketsPost } from "../../../queries/task_hooks.ts";

function AddBucket(props: { project_id: number }) {
  const { project_id } = props;
  const [newBucketName, setNewBucketName] = useState("");
  const { mutate: addBucket } = useBucketsPost({
    onSuccess: () => {
      setNewBucketName("");
      enqueueSnackbar({
        message: <Typography>Kategori ditambahkan!</Typography>,
        variant: "success",
      });
    },
  });

  return (
    <Stack direction={"row"} alignItems={"top"} width={"300px"}>
      <TextField
        label="Tambah Kategori"
        value={newBucketName}
        onChange={(e) => setNewBucketName(e.target.value)}
      ></TextField>
      <Button onClick={() => addBucket({ name: newBucketName, project_id })}>
        <Add />
      </Button>
    </Stack>
  );
}

export default AddBucket;
