import { Skeleton, Stack, Typography } from "@mui/material";
import { useProjectsDetailGet } from "../../../../queries/project_hooks.ts";
import ProjectMember from "../../components/ProjectMember.tsx";

function ProjectMembersList(props: { project_id: number }) {
  const { project_id } = props;
  const { data: project } = useProjectsDetailGet({ project_id });

  if (!project) {
    return <Skeleton />;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight={"bold"}>
        Anggota
      </Typography>
      {project.project_members
        .filter((x) => x.role === "Admin" || x.role === "Dev")
        .map((x) => {
          return <ProjectMember key={x.user_id} project_id={project_id} user_id={x.user_id} />;
        })}
    </Stack>
  );
}

export default ProjectMembersList;
