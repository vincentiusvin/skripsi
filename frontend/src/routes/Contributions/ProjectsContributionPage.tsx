import { Add } from "@mui/icons-material";
import { Button, Skeleton, Stack, Typography } from "@mui/material";
import { useParams } from "wouter";
import ContribList from "../../components/Cards/ContribList.tsx";
import StyledLink from "../../components/StyledLink.tsx";
import { useContributionsGet } from "../../queries/contribution_hooks.ts";
import AuthorizeProjects from "../Projects/components/AuthorizeProjects.tsx";

function ProjectsContribution(props: { project_id: number }) {
  const { project_id } = props;
  const { data: contributions } = useContributionsGet({
    project_id,
  });

  if (contributions == undefined) {
    return <Skeleton />;
  }

  return (
    <Stack>
      <Typography variant="h4" fontWeight={"bold"} textAlign={"center"} marginBottom={2}>
        Kontribusi Terbaru
      </Typography>
      <StyledLink to={`/projects/${project_id}/add-contribs`}>
        <Button fullWidth variant="contained" startIcon={<Add />}>
          Tambah Kontribusi
        </Button>
      </StyledLink>
      {contributions.map((contrib) => (
        <ContribList contribution_id={contrib.id} key={contrib.id} />
      ))}
    </Stack>
  );
}

function ProjectsContributionPage() {
  const { project_id: id } = useParams();
  const project_id = Number(id);

  return (
    <AuthorizeProjects allowedRoles={["Admin", "Dev"]}>
      <ProjectsContribution project_id={project_id} />
    </AuthorizeProjects>
  );
}

export default ProjectsContributionPage;
