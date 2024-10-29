import { Box, Skeleton } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useParams } from "wouter";
import { useProjectsDetailMembersGet } from "../../../queries/project_hooks.ts";
import { useSessionGet } from "../../../queries/sesssion_hooks.ts";
import AuthorizeProjects from "../components/AuthorizeProjects.tsx";
import ProjectApply from "./components/ProjectApply.tsx";
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

  return (
    <Grid container>
      <Grid size={9}>
        <ProjectInfo project_id={project_id} />
      </Grid>
      <Grid size={3}>
        <ProjectInvitePrompt project_id={project_id} user_id={user_id} />
        <ProjectApply user_id={user_id} project_id={project_id} role={role} />
      </Grid>
    </Grid>
  );
}

function ProjectDetailPage() {
  const { project_id: id } = useParams();
  const project_id = Number(id);

  const { data: user_data } = useSessionGet();

  return (
    <AuthorizeProjects allowedRoles={["Not Involved"]}>
      {user_data && user_data.logged ? (
        <ProjectLoggedIn project_id={project_id} user_id={user_data.user_id} />
      ) : (
        <ProjectInfo project_id={project_id} />
      )}
    </AuthorizeProjects>
  );
}

export default ProjectDetailPage;
