import { Save } from "@mui/icons-material";
import { Button, Skeleton, Stack, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import RichEditor from "../../components/RichEditor.tsx";
import { useContributionsPost } from "../../queries/contribution_hooks.ts";
import { useProjectsDetailGet } from "../../queries/project_hooks.ts";
import AuthorizeProjects from "../Projects/components/AuthorizeProjects.tsx";
import ContributionSelectPeople from "./components/ContributionUserSelect.tsx";

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
      setLocation(`/projects/${project_id}/contributions`);
    },
  });

  function addContribution() {
    postContribution({
      name: contributionName,
      description: contributionDesc,
      project_id,
      user_ids: contributionUsers,
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
          <ContributionSelectPeople
            value={contributionUsers}
            project_id={project_id}
            setValue={(x) => {
              setContributionUsers(x);
            }}
          />
          <RichEditor defaultValue={contributionDesc} onBlur={(x) => setContributionDesc(x)} />
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
