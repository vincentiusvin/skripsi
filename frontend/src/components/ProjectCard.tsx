import { Grid, Skeleton, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";
import { Link } from "wouter";
import { useProjectsDetailGet } from "../queries/project_hooks.ts";

function ProjectCard(props: { project_id: number; subtitle?: ReactNode; sidebar?: ReactNode }) {
  const { project_id, sidebar, subtitle } = props;
  const { data: project_data } = useProjectsDetailGet({ project_id });

  if (!project_data) {
    return (
      <Grid container minWidth={280} spacing={4} alignItems={"center"}>
        <Grid item xs={4}>
          <Skeleton width={"100%"}></Skeleton>
        </Grid>
      </Grid>
    );
  }

  if (sidebar) {
    return (
      <Grid container width={280} spacing={4} alignItems={"center"}>
        <Grid item xs={12} lg={6}>
          <Stack>
            <Link to={`/projects/${project_id}`}>
              <Typography variant="h6" color="white">
                {project_data.project_name}
              </Typography>
            </Link>
            <Typography variant="body2" color={"GrayText"}>
              {subtitle}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Stack spacing={2}>{sidebar}</Stack>
        </Grid>
      </Grid>
    );
  } else {
    return (
      <Grid container width={140} spacing={4} alignItems={"center"}>
        <Grid item xs={12}>
          <Stack>
            <Link to={`/orgs/${project_id}`}>
              <Typography variant="h6" color="white">
                {project_data.project_name}
              </Typography>
            </Link>
            <Typography variant="body2" color={"GrayText"}>
              {subtitle}
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    );
  }
}

export default ProjectCard;
