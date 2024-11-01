import { Box, Divider, Skeleton, Stack, Typography } from "@mui/material";
import MarkdownViewer from "../../../../components/MarkdownViewer.tsx";
import { useProjectsDetailGet } from "../../../../queries/project_hooks.ts";

function ProjectInfo(props: { project_id: number }) {
  const { project_id } = props;
  const { data: project } = useProjectsDetailGet({ project_id });

  if (!project) {
    return <Skeleton />;
  }

  return (
    <Stack gap={2}>
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
      <Divider />
      <Box sx={{ padding: 2 }}>
        <MarkdownViewer>{project.project_content ?? ""}</MarkdownViewer>
      </Box>
    </Stack>
  );
}

export default ProjectInfo;
