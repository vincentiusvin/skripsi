import { Skeleton, Stack, Typography } from "@mui/material";
import OrgCard from "../../../../components/Cards/OrgCard.tsx";
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
      <OrgCard org_id={project.org_id}></OrgCard>
    </Stack>
  );
}

export default ProjectOrgDisplay;
