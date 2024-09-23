import { Check, Delete, Edit, Logout, MoreVert } from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import StyledLink from "../../../components/StyledLink.tsx";
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

  const [drawerAnchor, setDrawerAnchor] = useState<HTMLElement | undefined>();

  if (!project) {
    return <Skeleton />;
  }

  return (
    <Stack height={"100%"}>
      <Grid container rowGap={2}>
        <Grid
          order={1}
          size={{
            xs: 10,
            lg: 3,
          }}
          offset={{
            xs: 1,
            lg: 0,
          }}
        >
          <Typography
            variant="h3"
            fontWeight={"bold"}
            textAlign={"center"}
            sx={{
              wordBreak: "break-word",
            }}
          >
            {project.project_name}
          </Typography>
        </Grid>
        <Grid
          order={{ lg: 2, xs: 4 }}
          size={{
            xs: 12,
            lg: 6,
          }}
        >
          <Tabs
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              maxWidth: "min-content",
              margin: "auto",
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
        <Grid
          order={3}
          alignItems={"center"}
          display="flex"
          justifyContent={"end"}
          size={{
            xs: 1,
            lg: 3,
          }}
        >
          <>
            <IconButton onClick={(e) => setDrawerAnchor(e.currentTarget)}>
              <MoreVert />
            </IconButton>
            <Menu
              open={drawerAnchor != undefined}
              onClose={() => setDrawerAnchor(undefined)}
              anchorEl={drawerAnchor}
            >
              {role === "Admin"
                ? [
                    <StyledLink to={`/projects/${project_id}/edit`} key={1}>
                      <MenuItem>
                        <ListItemIcon>
                          <Edit />
                        </ListItemIcon>
                        <ListItemText>
                          <Typography
                            sx={{
                              textDecoration: "none",
                            }}
                          >
                            Edit
                          </Typography>
                        </ListItemText>
                      </MenuItem>
                    </StyledLink>,
                    <MenuItem onClick={() => deleteProject()} key={2}>
                      <ListItemIcon>
                        <Delete />
                      </ListItemIcon>
                      <ListItemText>Hapus</ListItemText>
                    </MenuItem>,
                  ]
                : null}
              <MenuItem onClick={() => leaveProject()}>
                <ListItemIcon>
                  <Logout />
                </ListItemIcon>
                <ListItemText>Keluar</ListItemText>
              </MenuItem>
            </Menu>
          </>
        </Grid>
      </Grid>
      <Box minHeight={"100vh"}>
        {activeTab === "disc" && <ChatroomWrapper project_id={project_id} user_id={user_id} />}
        {activeTab === "info" && <ProjectInfo project_id={project_id} />}
        {activeTab === "manage" && <ProjectManage project_id={project_id} />}
        {activeTab === "tasks" && <Kanban project_id={project_id} />}
      </Box>
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
    <Grid container rowSpacing={2}>
      <Grid
        size={{
          xs: 12,
          md: 8,
        }}
        offset={{
          md: 2,
        }}
      >
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
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 2,
        }}
      >
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
      <Grid size={12}>
        <ProjectInfo project_id={project_id} />
      </Grid>
    </Grid>
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
      <Grid container rowSpacing={2}>
        <Grid size={12}>
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
        </Grid>
        <Grid size={12}>
          <ProjectInfo project_id={project_id} />
        </Grid>
      </Grid>
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
