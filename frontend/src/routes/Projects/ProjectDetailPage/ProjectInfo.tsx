import { Avatar, Box, Chip, Grid, Skeleton, Stack, Typography } from "@mui/material";
import {
  useProjectsDetailGet,
  useProjectsDetailMembersGet,
} from "../../../queries/project_hooks.ts";
import { useUserAccountDetailGet } from "../../../queries/user_hooks.ts";

function ProjectMember(props: { user_id: number; project_id: number }) {
  const { user_id, project_id } = props;
  const { data: user_data } = useUserAccountDetailGet({
    user_id,
  });
  const { data: member_data } = useProjectsDetailMembersGet({
    user_id,
    project_id,
  });

  if (!user_data || !member_data) {
    return (
      <Stack direction={"row"} alignItems={"center"} gap={2}>
        <Avatar src={undefined}></Avatar>
        <Skeleton width={"100%"}></Skeleton>
      </Stack>
    );
  }
  return (
    <Stack direction={"row"} alignItems={"center"} gap={2}>
      <Avatar src={user_data.user_image ?? undefined}></Avatar>
      <Stack>
        <Typography>{user_data.user_name}</Typography>
        <Typography variant="body2" color={"GrayText"}>
          {member_data.role}
        </Typography>
      </Stack>
    </Stack>
  );
}

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
