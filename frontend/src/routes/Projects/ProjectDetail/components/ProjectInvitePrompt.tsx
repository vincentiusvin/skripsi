import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import {
  useProjectsDetailMembersDelete,
  useProjectsDetailMembersGet,
  useProjectsDetailMembersPut,
} from "../../../../queries/project_hooks.ts";

function ProjectInvitePrompt(props: { project_id: number; user_id: number }) {
  const { project_id, user_id } = props;
  const [open, setOpen] = useState(true);

  const { data: role } = useProjectsDetailMembersGet({
    project_id,
    user_id,
  });

  const { mutate: putMember } = useProjectsDetailMembersPut({
    project_id: project_id,
    user_id: user_id,
    onSuccess: (x) => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>User berhasil ditambahkan sebagai {x.role}!</Typography>,
      });
    },
  });

  const { mutate: deleteMember } = useProjectsDetailMembersDelete({
    project_id: project_id,
    user_id: user_id,
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>User berhasil dihapus!</Typography>,
      });
    },
  });

  if (role == undefined || role.role !== "Invited") {
    return null;
  }

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>Terima Undangan?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Anda diundang oleh pengurus proyek ini untuk ikut berpartisipasi. Anda dapat menerima atau
          menolak undangan ini.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            deleteMember();
          }}
        >
          Tolak
        </Button>
        <Button
          onClick={() => {
            putMember({
              role: "Dev",
            });
          }}
        >
          Terima
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProjectInvitePrompt;
