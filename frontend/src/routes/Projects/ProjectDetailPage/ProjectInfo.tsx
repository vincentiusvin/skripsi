import { Box, Chip, Grid, Skeleton, Stack, Typography } from "@mui/material";
import { useProjectsDetailGet } from "../../../queries/project_hooks.ts";
import ProjectMember from "./ProjectMemberComponent.tsx";

function ProjectInfo(props: { project_id: number }) {
  const { project_id } = props;
  const { data: project } = useProjectsDetailGet({ project_id });

  if (!project) {
    return <Skeleton />;
  }

  return (
    <Stack gap={2}>
      <Box textAlign={"center"}>
        <Typography variant="h5" fontWeight="bold">
          Project Description
        </Typography>
        <Typography>{project.project_desc}</Typography>
      </Box>
      <Box textAlign={"center"}>
        <Typography variant="h5" fontWeight="bold">
          Organization
        </Typography>
        <Typography>{project.org_id}</Typography>
      </Box>
      <Box textAlign={"center"}>
        <Typography variant="h5" fontWeight={"bold"} mb={1}>
          Categories
        </Typography>
        <Stack direction={"row"} justifyContent={"center"} spacing={2}>
          {project.project_categories.map((category, index) => (
            <Chip key={index} label={category.category_name} />
          ))}
        </Stack>
      </Box>
      <Box>
        <Typography variant="h5" fontWeight={"bold"} textAlign={"center"} mb={1}>
          Collaborators
        </Typography>
        <Grid container width={"75%"} margin={"0 auto"} spacing={2}>
          {project.project_members
            .filter((x) => x.role !== "Pending")
            .map((x, i) => {
              return (
                <Grid item xs={6} md={4} lg={2} key={i}>
                  <ProjectMember project_id={project_id} user_id={x.user_id} />
                </Grid>
              );
            })}
        </Grid>
      </Box>
    </Stack>
  );
}

export default ProjectInfo;
