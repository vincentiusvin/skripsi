import { Button, Skeleton, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import { useLocation, useParams } from "wouter";
import StyledLink from "../../components/StyledLink.tsx";
import { APIError } from "../../helpers/fetch.ts";
import { useProjectsDetailDelete, useProjectsDetailGet } from "../../queries/project_hooks.ts";

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
    <Grid container spacing={2}>
      <Grid size={6}>
        <StyledLink to={`/projects/${project_id}/edit`}>
          <Button>Edit Proyek</Button>
        </StyledLink>
      </Grid>
      <Grid size={6}>
        <Button color="error" onClick={() => deleteProject()}>
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

  return <ProjectsManage project_id={project_id} />;
}

export default ProjectsManagePage;
