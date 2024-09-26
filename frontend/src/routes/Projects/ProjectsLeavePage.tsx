import { Box, Button, Skeleton, Stack, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useParams } from "wouter";
import { useProjectsDetailMembersDelete } from "../../queries/project_hooks.ts";
import { useSessionGet } from "../../queries/sesssion_hooks.ts";
import AuthorizeProjects, { RedirectBack } from "./components/AuthorizeProjects.tsx";

function ProjectLeave(props: { project_id: number; user_id: number }) {
  const { project_id, user_id } = props;

  const { mutate: leaveProject } = useProjectsDetailMembersDelete({
    project_id: project_id,
    user_id: user_id,
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>Berhasil meninggalkan projek!</Typography>,
      });
    },
  });
  return (
    <Stack
      direction={"column"}
      justifyContent={"center"}
      height={"100%"}
      textAlign={"center"}
      spacing={8}
      width={"75%"}
      margin={"auto"}
    >
      <Box>
        <Typography variant="h5">Apakah anda yakin ingin meninggalkan proyek ini?</Typography>
        <Typography variant="body1">
          Anda tidak dapat membaca diskusi dan perkembangan selanjutnya pada proyek ini, namun
          kontribusi yang pernah dikerjakan sebelumnya masih akan tersimpan.
        </Typography>
      </Box>
      <Button color="error" variant="contained" onClick={() => leaveProject()}>
        Keluar
      </Button>
    </Stack>
  );
}

function ProjectsLeavePage() {
  const { project_id: id } = useParams();
  const project_id = Number(id);
  const { data: sessionData } = useSessionGet();

  if (!sessionData) {
    return <Skeleton />;
  }

  if (!sessionData.logged) {
    return <RedirectBack />;
  }

  return (
    <AuthorizeProjects allowedRoles={["Admin", "Dev"]}>
      <ProjectLeave user_id={sessionData.user_id} project_id={project_id} />
    </AuthorizeProjects>
  );
}

export default ProjectsLeavePage;
