import { Button, Skeleton, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import { useParams } from "wouter";
import StyledLink from "../../components/StyledLink.tsx";
import { useProjectsDetailGet, useProjectsDetailPut } from "../../queries/project_hooks.ts";
import AuthorizeProjects from "./components/AuthorizeProjects.tsx";

function ArchiveProject(props: { project_id: number }) {
  const { project_id } = props;

  const { mutate: _putProject } = useProjectsDetailPut({
    project_id: project_id,
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>Berhasil mengarsipkan projek!</Typography>,
      });
    },
  });

  const { data: project } = useProjectsDetailGet({
    project_id,
  });

  function archiveProject(archived: boolean) {
    _putProject({
      archive: archived,
    });
  }

  if (project == undefined) {
    return <Skeleton />;
  }

  if (project.project_archived === true) {
    return (
      <>
        <Typography variant="h5">Aktifkan Proyek</Typography>
        <Typography variant="body1">
          Proyek akan diaktifkan kembali dan dapat menerima anggota baru.
        </Typography>
        <Button
          variant="contained"
          color="warning"
          fullWidth
          onClick={() => archiveProject(false)}
          sx={{
            margin: "auto",
            mt: 4,
          }}
        >
          Aktifkan Proyek
        </Button>
      </>
    );
  } else {
    return (
      <>
        <Typography variant="h5">Arsipkan Proyek</Typography>
        <Typography variant="body1">
          Proyek akan diarsipkan dan tidak dapat menerima developer baru.
        </Typography>
        <Button
          variant="contained"
          color="error"
          fullWidth
          onClick={() => archiveProject(true)}
          sx={{
            margin: "auto",
            mt: 4,
          }}
        >
          Arsipkan Proyek
        </Button>
      </>
    );
  }
}

function ProjectsManage(props: { project_id: number }) {
  const { project_id } = props;

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
        <ArchiveProject project_id={project_id} />
      </Grid>
    </Grid>
  );
}

function ProjectsManagePage() {
  const { project_id: id } = useParams();
  const project_id = Number(id);

  return (
    <AuthorizeProjects allowedRoles={["Admin"]}>
      <ProjectsManage project_id={project_id} />
    </AuthorizeProjects>
  );
}

export default ProjectsManagePage;
