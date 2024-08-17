import { ArrowBack, Check, Delete, Edit, Logout } from "@mui/icons-material";
import { Button, Grid, Skeleton, Stack, Tab, Tabs, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { APIError } from "../../../helpers/fetch.ts";
import {
  useProjectsDetailDelete,
  useProjectsDetailGet,
  useProjectsDetailMembersDelete,
  useProjectsDetailMembersGet,
  useProjectsDetailMembersPut,
} from "../../../queries/project_hooks.ts";
import { useSessionGet } from "../../../queries/sesssion_hooks.ts";
import { ChatroomWrapper } from "./ProjectChatroom.tsx";
import ProjectInfo from "./ProjectInfo.tsx";
import ProjectManage from "./ProjectManage.tsx";
import { MemberRoles } from "./ProjectMemberComponent.tsx";
import Kanban from "./Tasks.tsx";

function InvolvedView(props: { project_id: number; user_id: number; role: MemberRoles }) {
  const { project_id, user_id, role } = props;
  const [activeTab, setActiveTab] = useState<"disc" | "info" | "manage" | "tasks">("disc");

  const [, setLocation] = useLocation();
  const { data: project } = useProjectsDetailGet({
    project_id: project_id,
    retry: (failureCount, error) => {
      if ((error instanceof APIError && error.status === 404) || failureCount > 3) {
        setLocation("/projects");
        return false;
      }
      return true;
    },
  });

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

  const { mutate: deleteProject } = useProjectsDetailDelete({
    project_id: project_id,
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>Berhasil menghapus projek!</Typography>,
      });
    },
  });

  if (!project) {
    return <Skeleton />;
  }

  return (
    <Stack height={"100%"}>
      <Grid container>
        <Grid item xs={3}>
          <Typography variant="h3" fontWeight={"bold"}>
            {project.project_name}
          </Typography>
        </Grid>
        <Grid item xs={6}>
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
        {role === "Admin" ? (
          <>
            <Grid item xs={1}>
              <Link to={`/projects/${project_id}/edit`}>
                <Button endIcon={<Edit />} variant="contained" fullWidth>
                  Edit
                </Button>
              </Link>
            </Grid>
            <Grid item xs={1}>
              <Button
                endIcon={<Delete />}
                variant="contained"
                fullWidth
                onClick={() => {
                  deleteProject();
                }}
              >
                Hapus
              </Button>
            </Grid>
          </>
        ) : (
          <Grid item xs={2} />
        )}
        <Grid item xs={1}>
          <Button fullWidth endIcon={<Logout />} onClick={() => leaveProject()} variant="contained">
            Keluar
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

  const [, setLocation] = useLocation();
  const { data: project } = useProjectsDetailGet({
    project_id: project_id,
    retry: (failureCount, error) => {
      if ((error instanceof APIError && error.status === 404) || failureCount > 3) {
        setLocation("/projects");
        return false;
      }
      return true;
    },
  });

  const { mutate: addMember } = useProjectsDetailMembersPut({
    project_id: project_id,
    user_id: user_id,
    onSuccess: (x) => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>Status anda {x.role}</Typography>,
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
            disabled={role === "Admin" || role === "Dev"}
            fullWidth
            onClick={() => {
              if (role === "Not Involved") {
                addMember({
                  role: "Pending",
                });
              } else if (role === "Invited") {
                addMember({
                  role: "Dev",
                });
              }
            }}
          >
            {role === "Invited" ? "Accept" : role === "Pending" ? "Applied" : "Apply"}
          </Button>
        </Grid>
      </Grid>
      <ProjectInfo project_id={project_id} />
    </>
  );
}

function UnauthenticatedView(props: { project_id: number }) {
  const { project_id } = props;

  const [, setLocation] = useLocation();
  const { data: project } = useProjectsDetailGet({
    project_id: project_id,
    retry: (failureCount, error) => {
      if ((error instanceof APIError && error.status === 404) || failureCount > 3) {
        setLocation("/projects");
        return false;
      }
      return true;
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
        <Grid item xs={1}></Grid>
      </Grid>
      <ProjectInfo project_id={project_id} />
    </>
  );
}

function ProjectTryAuth(props: { project_id: number; user_id: number }) {
  const { project_id, user_id } = props;
  const { data: membership } = useProjectsDetailMembersGet({
    project_id: project_id,
    user_id: user_id,
  });
  const role = membership?.role;
  if (!role) {
    return <Skeleton />;
  }

  if (role === "Admin" || role === "Dev") {
    return <InvolvedView project_id={project_id} user_id={user_id} role={role} />;
  } else {
    return <UninvolvedView project_id={project_id} user_id={user_id} role={role} />;
  }
}

function ProjectDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  if (id === undefined) {
    setLocation("/projects");
  }
  const project_id = Number(id);

  const { data: user_data } = useSessionGet();

  const { data: project } = useProjectsDetailGet({
    project_id,
    retry: (failureCount, error) => {
      if ((error instanceof APIError && error.status === 404) || failureCount > 3) {
        setLocation("/projects");
        return false;
      }
      return true;
    },
  });

  if (!project) {
    return <Skeleton />;
  }

  if (user_data && user_data.logged) {
    return <ProjectTryAuth project_id={project_id} user_id={user_data.user_id} />;
  } else {
    return <UnauthenticatedView project_id={project_id} />;
  }
}

export default ProjectDetailPage;
