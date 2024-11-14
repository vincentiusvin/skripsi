import { Divider, Stack } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useParams } from "wouter";
import { useSessionGet } from "../../../queries/sesssion_hooks.ts";
import AuthorizeProjects from "../components/AuthorizeProjects.tsx";
import ProjectApply from "./components/ProjectApply.tsx";
import ProjectArchiveWarning from "./components/ProjectArchiveWarning.tsx";
import ProjectInfo from "./components/ProjectInfo.tsx";
import ProjectInvitePrompt from "./components/ProjectInvitePrompt.tsx";
import ProjectLabelDisplay from "./components/ProjectLabelDisplay.tsx";
import ProjectMembersList from "./components/ProjectMembersList.tsx";
import ProjectOrgDisplay from "./components/ProjectOrgsDisplay.tsx";

function ProjectDetail(props: { project_id: number }) {
  const { project_id } = props;

  const { data: session } = useSessionGet();
  const user_id = session?.logged ? session.user_id : undefined;

  return (
    <Stack spacing={2}>
      <ProjectArchiveWarning project_id={project_id} />
      {user_id !== undefined ? (
        <ProjectInvitePrompt project_id={project_id} user_id={user_id} />
      ) : null}
      <Grid container spacing={2}>
        <Grid
          size={{
            xs: 12,
            md: 8,
            lg: 9,
          }}
        >
          <ProjectInfo project_id={project_id} />
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 4,
            lg: 3,
          }}
        >
          <Stack spacing={2} divider={<Divider />}>
            {user_id !== undefined ? (
              <ProjectApply user_id={user_id} project_id={project_id} />
            ) : null}
            <ProjectOrgDisplay project_id={project_id} />
            <ProjectMembersList project_id={project_id} />
            <ProjectLabelDisplay project_id={project_id} />
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}

function ProjectDetailPage() {
  const { project_id: id } = useParams();
  const project_id = Number(id);

  return (
    <AuthorizeProjects allowedRoles={["Not Involved"]}>
      <ProjectDetail project_id={project_id} />
    </AuthorizeProjects>
  );
}

export default ProjectDetailPage;
