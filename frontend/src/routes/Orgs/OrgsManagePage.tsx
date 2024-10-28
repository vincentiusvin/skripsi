import { Button, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useParams } from "wouter";
import StyledLink from "../../components/StyledLink.tsx";
import AuthorizeOrgs from "./components/AuthorizeOrgs.tsx";

function OrgManage(props: { org_id: number }) {
  const { org_id } = props;

  return (
    <Grid container spacing={2} minHeight={"inherit"}>
      <Grid
        size={{
          xs: 12,
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
