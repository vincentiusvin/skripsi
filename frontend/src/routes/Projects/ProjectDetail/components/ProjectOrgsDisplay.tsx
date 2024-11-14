import { Skeleton, Stack, Typography } from "@mui/material";
import OrgCard from "../../../../components/Cards/OrgCard.tsx";
import StyledLink from "../../../../components/StyledLink.tsx";
import { useProjectsDetailGet } from "../../../../queries/project_hooks.ts";

function ProjectOrgDisplay(props: { project_id: number }) {
  const { project_id } = props;
  const { data: project } = useProjectsDetailGet({ project_id });

  if (!project) {
    return <Skeleton />;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight={"bold"}>
        Organisasi
      </Typography>
      <StyledLink to={`/orgs/${project.org_id}`}>
        <OrgCard org_id={project.org_id}></OrgCard>
      </StyledLink>
    </Stack>
  );
}

export default ProjectOrgDisplay;
