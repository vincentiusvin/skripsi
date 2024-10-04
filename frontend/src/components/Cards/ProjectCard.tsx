import {
  Card,
  CardActionArea,
  CardActions,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { ReactNode } from "react";
import { useProjectsDetailGet } from "../../queries/project_hooks.ts";
import StyledLink from "../StyledLink.tsx";

function ProjectCard(props: { project_id: number; subtitle?: ReactNode; sidebar?: ReactNode }) {
  const { project_id, sidebar, subtitle } = props;
  const { data: project_data } = useProjectsDetailGet({ project_id });

  if (!project_data) {
    return (
      <Paper>
        <Stack direction="row" spacing={4} alignItems="center" height="100%" width={"100%"}>
          <Skeleton width={"100%"}></Skeleton>
        </Stack>
      </Paper>
    );
  }

  return (
    <Card>
      <CardActionArea
        sx={{
          padding: 2,
        }}
      >
        <StyledLink to={`/projects/${project_id}`}>
          <Typography variant="h6">{project_data.project_name}</Typography>
          <Typography variant="body2">{subtitle}</Typography>
        </StyledLink>
      </CardActionArea>
      {sidebar ? (
        <CardActions
          sx={{
            paddingX: 2,
          }}
        >
          {sidebar}
        </CardActions>
      ) : null}
    </Card>
  );
}

export default ProjectCard;
