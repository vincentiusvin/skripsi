import { Button, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import { useParams } from "wouter";
import StyledLink from "../../components/StyledLink.tsx";
import { useOrgsDelete } from "../../queries/org_hooks.ts";
import AuthorizeOrgs from "./components/AuthorizeOrgs.tsx";

function OrgManage(props: { org_id: number }) {
  const { org_id } = props;

  const { mutate: deleteOrg } = useOrgsDelete({
    id: org_id,
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>Berhasil menghapus projek!</Typography>,
      });
    },
  });

  return (
    <Grid container spacing={2} minHeight={"inherit"}>
      <Grid
        size={{
          xs: 12,
          md: 6,
        }}
        margin={"auto"}
        textAlign={"center"}
      >
        <Typography variant="h5">Edit Organisasi</Typography>
        <Typography variant="body1">
          Anda dapat mengubah gambar, nama dan deskripsi organisasi disini
        </Typography>
        <StyledLink to={`/orgs/${org_id}/edit`}>
          <Button
            variant="contained"
            fullWidth
            sx={{
              mt: 4,
            }}
          >
            Edit Organisasi
          </Button>
        </StyledLink>
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 6,
        }}
        margin="auto"
        textAlign={"center"}
      >
        <Typography variant="h5">Hapus Organisasi</Typography>
        <Typography variant="body1">
          Organisasi akan dihapus. Tindakan ini tidak dapat diurungkan
        </Typography>
        <Button
          variant="contained"
          color="error"
          fullWidth
          onClick={() => deleteOrg()}
          sx={{
            margin: "auto",
            mt: 4,
          }}
        >
          Hapus Proyek
        </Button>
      </Grid>
    </Grid>
  );
}

function OrgsManagePage() {
  const { org_id: id } = useParams();
  const org_id = Number(id);

  return (
    <AuthorizeOrgs allowedRoles={["Admin"]}>
      <OrgManage org_id={org_id} />
    </AuthorizeOrgs>
  );
}

export default OrgsManagePage;
