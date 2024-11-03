import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useProjectsDetailChatroomsPost } from "../queries/chat_hooks.ts";

function CreateProjectChatroomDialog(props: { project_id: number }) {
  const { project_id } = props;
  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [addRoomName, setAddRoomName] = useState("");
  const { mutate: createRoom } = useProjectsDetailChatroomsPost({
    project_id,
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Ruang chat berhasil dibuat!</Typography>,
        variant: "success",
      });
      reset();
    },
  });

  function reset() {
    setAddRoomName("");
    setAddRoomOpen(false);
  }

  return (
    <>
      <Dialog open={addRoomOpen} onClose={() => reset()}>
        <DialogTitle>Tambah ruangan baru</DialogTitle>
        <DialogContent>
          <Box pt={2}>
            <TextField
              value={addRoomName ?? ""}
              fullWidth
              onChange={(e) => setAddRoomName(e.target.value)}
              label="Nama ruangan"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              createRoom({
                name: addRoomName,
              })
            }
          >
            Buat ruangan
          </Button>
        </DialogActions>
      </Dialog>
      <Button
        fullWidth
        variant="contained"
        onClick={() => {
          setAddRoomOpen(true);
        }}
      >
        Tambah Ruangan
      </Button>
    </>
  );
}

export default CreateProjectChatroomDialog;
