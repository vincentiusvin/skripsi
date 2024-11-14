import { Chip, Skeleton, Stack, Typography } from "@mui/material";
import { useProjectsDetailGet } from "../../../../queries/project_hooks.ts";

function ProjectLabelDisplay(props: { project_id: number }) {
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
      {project.project_categories.length !== 0 ? (
        <Stack direction={"row"} spacing={2} flexWrap={"wrap"}>
          {project.project_categories.map((category, index) => (
            <Chip color="secondary" key={index} label={category.category_name} />
          ))}
        </Stack>
      ) : (
        <Typography variant="body1">Proyek belum diberikan kategori oleh pengurus</Typography>
      )}
    </Stack>
  );
}

export default ProjectLabelDisplay;
