import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useState } from "react";
import {
  useOrgsDetailMembersDelete,
  useOrgsDetailMembersGet,
  useOrgsDetailMembersPut,
} from "../../../../queries/org_hooks.ts";

function OrgsInvitePrompt(props: { org_id: number; user_id: number }) {
  const { org_id, user_id } = props;
  const [open, setOpen] = useState(true);

  const { mutate: acceptInvite } = useOrgsDetailMembersPut({
    org_id,
    user_id,
  });

  const { mutate: rejectInvite } = useOrgsDetailMembersDelete({
    org_id,
    user_id,
  });

  const { data: role } = useOrgsDetailMembersGet({
    org_id,
    user_id,
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
            rejectInvite();
          }}
        >
          Tolak
        </Button>
        <Button
          onClick={() => {
            acceptInvite({
              role: "Admin",
            });
          }}
        >
          Terima
        </Button>
      </DialogActions>
    </Dialog>
  );
}
export default OrgsInvitePrompt;
