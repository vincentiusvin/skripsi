import { Box, Skeleton } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useParams } from "wouter";
import { useProjectsDetailMembersGet } from "../../../queries/project_hooks.ts";
import { useSessionGet } from "../../../queries/sesssion_hooks.ts";
import AuthorizeProjects from "../components/AuthorizeProjects.tsx";
import ProjectApply from "./components/ProjectApply.tsx";
import ProjectArchiveWarning from "./components/ProjectArchiveWarning.tsx";
import ProjectInfo from "./components/ProjectInfo.tsx";
import ProjectInvitePrompt from "./components/ProjectInvitePrompt.tsx";

function ProjectLoggedIn(props: { project_id: number; user_id: number }) {
  const { project_id, user_id } = props;
  const { data: membership } = useProjectsDetailMembersGet({
    project_id: project_id,
    user_id: user_id,
  });
  const role = membership?.role;

  if (role == undefined) {
    return <Skeleton />;
  }

  if (role === "Admin" || role === "Dev") {
    return <ProjectInfo project_id={project_id} />;
  }
  if (role === "Not Involved" || role === "Pending") {
    return (
      <Box>
        <ApplyButton user_id={user_id} project_id={project_id} role={role} />
        <ProjectInfo project_id={project_id} />
      </Box>
    );
  }

  if (role === "Invited") {
    return (
      <>
        <InvitedDialog project_id={project_id} user_id={user_id} />
        <ProjectInfo project_id={project_id} />
      </>
    );
  }
}

function ProjectDetail(props: { project_id: number }) {
  const { project_id } = props;

  const { data: session } = useSessionGet();
  const user_id = session?.logged ? session.user_id : undefined;

  return (
    <Box>
      <ProjectArchiveWarning project_id={project_id} />
      {user_id !== undefined ? (
        <ProjectInvitePrompt project_id={project_id} user_id={user_id} />
      ) : null}
      <Grid container>
        <Grid size={9}>
          <ProjectInfo project_id={project_id} />
        </Grid>
        <Grid size={3}>
          {user_id !== undefined ? (
            <ProjectApply user_id={user_id} project_id={project_id} />
          ) : null}
        </Grid>
      </Grid>
    </Box>
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
