import { ArrowBack, Check, Logout } from "@mui/icons-material";
import { Button, Grid, Skeleton, Stack, Tab, Tabs, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { API } from "../../../../../backend/src/routes.ts";
import {
  useProjectsDetailGet,
  useProjectsDetailMembersDelete,
  useProjectsDetailMembersGet,
  useProjectsDetailMembersPut,
} from "../../../queries/project_hooks.ts";
import { useSessionGet } from "../../../queries/sesssion_hooks.ts";
import { ChatroomWrapper } from "./ProjectChatroom.tsx";
import ProjectInfo from "./ProjectInfo.tsx";
import ProjectManage from "./ProjectManage.tsx";
import Kanban from "./Tasks.tsx";

type MemberRoles = API["ProjectsDetailMembersGet"]["ResBody"]["role"] | "Not Involved";

function InvolvedView(props: { project_id: number; user_id: number; role: MemberRoles }) {
  const { project_id, user_id, role } = props;
  const [activeTab, setActiveTab] = useState<"disc" | "info" | "manage" | "tasks">("disc");
  const { data: project } = useProjectsDetailGet({ project_id });

  const { mutate: leaveProject } = useProjectsDetailMembersDelete({
    project_id: project_id,
    user_id: user_id,
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>Berhasil meninggalkan projek!</Typography>,
      });
    },
  });

  if (!project) {
    return <Skeleton />;
  }

  return (
    <Stack height={"100%"}>
      <Grid container>
        <Grid item xs={1}>
          <Typography variant="h3" fontWeight={"bold"}>
            {project.project_name}
          </Typography>
        </Grid>
        <Grid item xs={10}>
          <Tabs
            centered
            sx={{
              flexGrow: 1,
            }}
            value={activeTab}
            onChange={(_e, newRoomId) => {
              setActiveTab(newRoomId);
            }}
          >
            <Tab label={"Discussion"} value="disc" />
            <Tab label={"Tasks"} value="tasks" />
            <Tab label={"Info"} value="info" />
            {role === "Admin" && <Tab label={"Manage"} value="manage" />}
          </Tabs>
        </Grid>
        <Grid item xs={1}>
          <Button endIcon={<Logout />} onClick={() => leaveProject()} variant="contained">
            Leave
          </Button>
        </Grid>
      </Grid>
      {activeTab === "disc" && <ChatroomWrapper project_id={project_id} user_id={user_id} />}
      {activeTab === "info" && <ProjectInfo project_id={project_id} />}
      {activeTab === "manage" && <ProjectManage project_id={project_id} />}
      {activeTab === "tasks" && <Kanban project_id={project_id} />}
    </Stack>
  );
}

function UninvolvedView(props: { project_id: number; user_id: number; role: MemberRoles }) {
  const { project_id, user_id, role } = props;

  const { data: project } = useProjectsDetailGet({
    project_id: project_id,
  });

  const { mutate: addMember } = useProjectsDetailMembersPut({
    project_id: project_id,
    user_id: user_id,
    onSuccess: (x) => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>Status anda "{x.role}"</Typography>,
      });
    },
  });

  if (!project) {
    return <Skeleton />;
  }

  return (
    <>
      <Grid container mt={2} rowSpacing={2}>
        <Grid item xs={1}>
          <Link to={"/projects"}>
            <Button startIcon={<ArrowBack />} variant="contained" fullWidth>
              Go Back
            </Button>
          </Link>
        </Grid>
        <Grid item xs={10}>
          <Typography variant="h4" fontWeight={"bold"} align="center">
            {project.project_name}
          </Typography>
        </Grid>
        <Grid item xs={1}>
          <Button
            endIcon={<Check />}
            variant="contained"
            disabled={role !== "Not Involved"}
            fullWidth
            onClick={() =>
              addMember({
                role: "Pending",
              })
            }
          >
            {role !== "Not Involved" ? "Applied" : "Apply"}
          </Button>
        </Grid>
      </Grid>
      <ProjectInfo project_id={project_id} />
    </>
  );
}

function ProjectDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  if (id === undefined) {
    setLocation("/projects");
  }
  const project_id = Number(id);

  const { data: user_data } = useSessionGet();
  const user_id = user_data?.logged ? user_data.user_id : undefined;

  const { data: membership } = useProjectsDetailMembersGet({
    project_id: project_id,
    user_id: user_id,
  });

  const role = membership?.role;

  if (!role || !user_id) {
    return <Skeleton />;
  }

  if (role === "Not Involved" || role === "Pending") {
    return <UninvolvedView project_id={project_id} user_id={user_id} role={role} />;
  } else {
    return <InvolvedView project_id={project_id} user_id={user_id} role={role} />;
  }
}

export default ProjectDetailPage;
