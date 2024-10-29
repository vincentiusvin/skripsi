import { Alert, Box, Chip, Skeleton, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import OrgCard from "../../../../components/Cards/OrgCard.tsx";
import MarkdownViewer from "../../../../components/MarkdownViewer.tsx";
import { useProjectsDetailGet } from "../../../../queries/project_hooks.ts";
import ProjectMember from "../../components/ProjectMember.tsx";

function ProjectInfo(props: { project_id: number }) {
  const { project_id } = props;
  const { data: project } = useProjectsDetailGet({ project_id });

  if (!project) {
    return <Skeleton />;
  }

  return (
    <Stack gap={2}>
      {project.project_archived ? (
        <Alert severity="warning">
          Proyek ini sudah diarsipkan oleh pengurus dan tidak lagi menerima lamaran anggota baru.
        </Alert>
      ) : null}
      <Typography
        variant="h4"
        fontWeight={"bold"}
        align="center"
        sx={{
          wordBreak: "break-word",
        }}
      >
        {project.project_name}
      </Typography>
      <Typography align="center">{project.project_desc}</Typography>
      <MarkdownViewer>{project.project_content ?? ""}</MarkdownViewer>
      <Stack direction={"row"} justifyContent={"center"} spacing={2}>
        {project.project_categories.map((category, index) => (
          <Chip key={index} label={category.category_name} />
        ))}
      </Stack>
      <Typography variant="h5" fontWeight="bold" textAlign={"center"}>
        Organisasi
      </Typography>
      <Box width={200} marginX={"auto"}>
        <OrgCard org_id={project.org_id}></OrgCard>
      </Box>
      <Typography variant="h5" fontWeight={"bold"} textAlign={"center"} mb={1}>
        Anggota
      </Typography>
      <Grid container width={"75%"} margin={"0 auto"} spacing={2}>
        {project.project_members
          .filter((x) => x.role === "Admin" || x.role === "Dev")
          .map((x, i) => {
            return (
              <Grid
                key={i}
                size={{
                  xs: 12,
                  md: 6,
                  lg: 4,
                }}
              >
                <ProjectMember project_id={project_id} user_id={x.user_id} />
              </Grid>
            );
          })}
      </Grid>
    </Stack>
  );
}

export default ProjectInfo;
