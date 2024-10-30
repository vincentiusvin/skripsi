import { Alert, Skeleton } from "@mui/material";
import { useProjectsDetailGet } from "../../../../queries/project_hooks.ts";

function ProjectArchiveWarning(props: { project_id: number }) {
  const { project_id } = props;
  const { data: project } = useProjectsDetailGet({ project_id });

  if (!project) {
    return <Skeleton />;
  }

  if (!project.project_archived) {
    return null;
  }

  return (
    <Alert severity="warning">
      Proyek ini sudah diarsipkan oleh pengurus dan tidak lagi menerima lamaran anggota baru.
    </Alert>
  );
}

export default ProjectArchiveWarning;
