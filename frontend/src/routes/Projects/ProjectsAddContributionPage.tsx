import { Save } from "@mui/icons-material";
import { Button, Skeleton, Stack, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import UserSelectMinimal from "../../components/UserSelectMinimal.tsx";
import { useContributionsPost } from "../../queries/contribution_hooks";
import { useProjectsDetailGet } from "../../queries/project_hooks.ts";
import AuthorizeProjects from "./components/AuthorizeProjects.tsx";

function ProjectsAddContribution(props: { project_id: number }) {
  const { project_id } = props;
  const [contributionName, setContributionName] = useState("");
  const [contributionDesc, setContributionDesc] = useState("");
  const [contributionUsers, setContributionUsers] = useState<number[]>([]);

  const [, setLocation] = useLocation();
  const { data: project } = useProjectsDetailGet({ project_id });

  const { mutate: postContribution } = useContributionsPost({
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Kontribusi berhasil ditambahkan!</Typography>,
        variant: "success",
      });
      setLocation("/contributions");
    },
  });

  function addContribution() {
    postContribution({
      name: contributionName,
      description: contributionDesc,
      project_id,
      user_id: [1],
    });
  }

  if (!project) {
    return <Skeleton />;
  }

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="h4" fontWeight={"bold"} align="center">
          Tambah Kontribusi
        </Typography>
      </Grid>
      <Grid size={12}>
        <Stack spacing={4}>
          <TextField
            fullWidth
            label="Judul"
            value={contributionName}
            onChange={(e) => setContributionName(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Deskripsi"
            value={contributionDesc}
            onChange={(e) => setContributionDesc(e.target.value)}
            required
            multiline
            minRows={4}
          />
          <UserSelectMinimal
            label="Kontributor"
            allowed_users={project.project_members
              .filter((x) => x.role === "Dev")
              .map((x) => x.user_id)}
            onChange={(x) => {
              setContributionUsers(x);
            }}
            current_users={contributionUsers}
          />
        </Stack>
      </Grid>
      <Grid size={12}>
        <Button variant="contained" fullWidth endIcon={<Save />} onClick={() => addContribution()}>
          Simpan
        </Button>
      </Grid>
    </Grid>
  );
}

function ProjectsAddContributionPage() {
  const { project_id: id } = useParams();
  const project_id = Number(id);

  return (
    <AuthorizeProjects allowedRoles={["Admin", "Dev"]}>
      <ProjectsAddContribution project_id={project_id} />
    </AuthorizeProjects>
  );
}

export default ProjectsAddContributionPage;
