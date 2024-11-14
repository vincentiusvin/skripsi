import { CorporateFare } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import OrgCard from "../../../../components/Cards/OrgCard.tsx";
import StyledLink from "../../../../components/StyledLink.tsx";
import { useOrgsGet } from "../../../../queries/org_hooks.ts";

function UserOrgsList(props: { user_id: number }) {
  const { user_id } = props;
  const { data: orgs_raw } = useOrgsGet({
    user_id,
  });
  const orgs = orgs_raw?.result;

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
          {orgs.length !== 0 ? (
            <Stack gap={2}>
              {orgs.map((x) => (
                <StyledLink to={`/orgs/${x.org_id}`} key={x.org_id}>
                  <OrgCard org_id={x.org_id} />
                </StyledLink>
              ))}
            </Stack>
          ) : (
            <Typography variant="body1">
              Pengguna ini tidak terlibat dalam organisasi anapun.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default UserOrgsList;
