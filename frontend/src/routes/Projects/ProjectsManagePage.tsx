import { Button, Skeleton, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import { useLocation, useParams } from "wouter";
import StyledLink from "../../components/StyledLink.tsx";
import { APIError } from "../../helpers/fetch.ts";
import { useProjectsDetailDelete, useProjectsDetailGet } from "../../queries/project_hooks.ts";
import AuthorizeProjects from "./components/AuthorizeProjects.tsx";

function ProjectsManage(props: { project_id: number }) {
  const { project_id } = props;

  const { mutate: deleteProject } = useProjectsDetailDelete({
    project_id: project_id,
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>Berhasil menghapus projek!</Typography>,
      });
    },
  });

  return (
    <Grid container spacing={2} height={"100%"}>
      <Grid
        size={{
          xs: 12,
          md: 6,
        }}
        margin={"auto"}
        textAlign={"center"}
      >
        <Typography variant="h5">Edit Proyek</Typography>
        <Typography variant="body1">
          Anda dapat mengubah nama dan deskripsi proyek disini
        </Typography>
        <StyledLink to={`/projects/${project_id}/edit`}>
          <Button
            variant="contained"
            fullWidth
            sx={{
              mt: 4,
            }}
          >
            Edit Proyek
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
        <Typography variant="h5">Hapus Proyek</Typography>
        <Typography variant="body1">
          Proyek akan dihapus. Tindakan ini tidak dapat diurungkan
        </Typography>
        <Button
          variant="contained"
          color="error"
          fullWidth
          onClick={() => deleteProject()}
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

function ProjectsManagePage() {
  const { project_id: id } = useParams();
  const [, setLocation] = useLocation();

  if (id === undefined) {
    setLocation("/projects");
  }
  const project_id = Number(id);

  const { data: project } = useProjectsDetailGet({
    project_id,
    retry: (failureCount, error) => {
      if ((error instanceof APIError && error.status === 404) || failureCount > 3) {
        setLocation("/projects");
        return false;
      }
      return true;
    },
  });
  if (!project) {
    return <Skeleton />;
  }

  return (
    <AuthorizeProjects allowedRoles={["Admin"]}>
      <ProjectsManage project_id={project_id} />
    </AuthorizeProjects>
  );
}

export default ProjectsManagePage;
