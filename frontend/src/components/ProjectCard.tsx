import { Skeleton, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { ReactNode } from "react";
import { useProjectsDetailGet } from "../queries/project_hooks.ts";
import StyledLink from "./StyledLink.tsx";

function ProjectCard(props: { project_id: number; subtitle?: ReactNode; sidebar?: ReactNode }) {
  const { project_id, sidebar, subtitle } = props;
  const { data: project_data } = useProjectsDetailGet({ project_id });

  if (!project_data) {
    return (
      <Grid container minWidth={280} spacing={4} alignItems={"center"}>
        <Grid size={4}>
          <Skeleton width={"100%"}></Skeleton>
        </Grid>
      </Grid>
    );
  }

  if (sidebar) {
    return (
      <Grid container width={280} spacing={4} alignItems={"center"}>
        <Grid
          size={{
            xs: 12,
            lg: 6,
          }}
        >
          <Stack>
            <StyledLink to={`/projects/${project_id}`}>
              <Typography variant="h6" color="primary">
                {project_data.project_name}
              </Typography>
            </StyledLink>
            <Typography variant="body2" color={"GrayText"}>
              {subtitle}
            </Typography>
          </Stack>
        </Grid>
        <Grid
          size={{
            xs: 12,
            lg: 6,
          }}
        >
          <Stack spacing={2}>{sidebar}</Stack>
        </Grid>
      </Grid>
    );
  } else {
    return (
      <Grid container width={140} spacing={4} alignItems={"center"}>
        <Grid size={12}>
          <Stack>
            <StyledLink to={`/orgs/${project_id}`}>
              <Typography variant="h6" color="primary">
                {project_data.project_name}
              </Typography>
            </StyledLink>
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
