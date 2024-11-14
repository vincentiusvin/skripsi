import { Divider, Skeleton, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import ProjectCard from "../../../../components/Cards/ProjectCard.tsx";
import { useProjectsGet } from "../../../../queries/project_hooks.ts";

function OrgsProjectList(props: { org_id: number }) {
  const { org_id } = props;

  const { data: projects_raw } = useProjectsGet({
    org_id: org_id,
  });
  const projects = projects_raw?.result;

  if (!projects) {
    return <Skeleton />;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight={"bold"}>
        Proyek ({projects.length})
      </Typography>
      <Divider />
      <Grid container spacing={2}>
        {projects.map((x, i) => (
          <Grid
            key={i}
            size={{
              xs: 12,
              sm: 6,
              lg: 4,
            }}
          >
            <ProjectCard project_id={x.project_id} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
export default OrgsProjectList;
