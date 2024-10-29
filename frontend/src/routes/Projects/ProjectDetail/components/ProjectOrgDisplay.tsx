import { Chip, Skeleton, Stack, Typography } from "@mui/material";
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
        Kategori
      </Typography>
      <Stack direction={"row"} spacing={2} flexWrap={"wrap"}>
        {project.project_categories.map((category, index) => (
          <Chip key={index} label={category.category_name} />
        ))}
      </Stack>
    </Stack>
  );
}

export default ProjectOrgDisplay;
