import { CorporateFare } from "@mui/icons-material";
import { Button, Dialog, DialogContent, DialogTitle, Paper, Skeleton, Stack } from "@mui/material";
import { useState } from "react";
import OrgCard from "../../../../components/OrgCard.tsx";
import { useOrgsGet } from "../../../../queries/org_hooks.ts";

function UserOrgsList(props: { user_id: number }) {
  const { user_id } = props;
  const { data: orgs } = useOrgsGet({
    user_id,
  });

  const [modalOpen, setModalOpen] = useState(false);

  if (!orgs) {
    return <Skeleton />;
  }

  return (
    <>
      <Button
        onClick={() => {
          setModalOpen(true);
        }}
        variant="outlined"
        startIcon={<CorporateFare />}
      >
        Terlibat dalam {orgs.length} organisasi
      </Button>
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>Daftar Organisasi</DialogTitle>
        <DialogContent>
          <Stack gap={2}>
            {orgs.map((x) => (
              <Paper
                key={x.org_id}
                sx={{
                  p: 2,
                }}
              >
                <OrgCard org_id={x.org_id} />
              </Paper>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default UserOrgsList;
