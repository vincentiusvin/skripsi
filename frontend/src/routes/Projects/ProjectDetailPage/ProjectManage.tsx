import { Button, Grid, Paper, Skeleton, Stack, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import {
  useProjectsDetailGet,
  useProjectsDetailMembersDelete,
  useProjectsDetailMembersPut,
} from "../../../queries/project_hooks.ts";
import ProjectMember from "./ProjectMemberComponent.tsx";

function PendingMember(props: { project_id: number; user_id: number }) {
  const { project_id, user_id } = props;
  const { mutate: putMember } = useProjectsDetailMembersPut({
    project_id: project_id,
    user_id: user_id,
    onSuccess: (x) => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>User berhasil ditambahkan sebagai {x.role}!</Typography>,
      });
    },
  });

  const { mutate: deleteMember } = useProjectsDetailMembersDelete({
    project_id: project_id,
    user_id: user_id,
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>User berhasil dihapus!</Typography>,
      });
    },
  });

  return (
    <Paper
      sx={{
        padding: 2,
        borderRadius: 2,
      }}
    >
      <Stack direction={"row"} spacing={2} justifyContent={"center"}>
        <ProjectMember project_id={project_id} user_id={user_id} />
        <Button
          onClick={() => {
            putMember({
              role: "Dev",
            });
          }}
        >
          Approve
        </Button>
        <Button
          onClick={() => {
            deleteMember();
          }}
        >
          Reject
        </Button>
      </Stack>
    </Paper>
  );
}

function ActiveMember(props: { project_id: number; user_id: number }) {
  const { project_id, user_id } = props;

  const { mutate: deleteMember } = useProjectsDetailMembersDelete({
    project_id: project_id,
    user_id: user_id,
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>User berhasil dihapus!</Typography>,
      });
    },
  });

  return (
    <Paper
      sx={{
        padding: 2,
        borderRadius: 2,
      }}
    >
      <Stack direction={"row"} spacing={2} justifyContent={"center"}>
        <ProjectMember project_id={project_id} user_id={user_id} />
        <Button
          onClick={() => {
            deleteMember();
          }}
        >
          Remove From Project
        </Button>
      </Stack>
    </Paper>
  );
}

function ProjectManage(props: { project_id: number }) {
  const { project_id } = props;
  const { data: project } = useProjectsDetailGet({ project_id });

  if (!project) {
    return <Skeleton />;
  }

  const pending_members = project.project_members.filter((x) => x.role === "Pending");
  const active_members = project.project_members.filter((x) => x.role !== "Pending");

  return (
    <Stack gap={2}>
      <Typography variant="h6" textAlign={"center"}>
        Pending Members
      </Typography>
      {pending_members.length ? (
        pending_members.map((x, i) => (
          <Grid key={i} container width={"85%"} margin={"0 auto"} spacing={2} columnSpacing={4}>
            <Grid item xs={3} justifyContent={"center"}>
              <PendingMember project_id={project_id} user_id={x.user_id} />
            </Grid>
          </Grid>
        ))
      ) : (
        <Typography textAlign={"center"}>There are no pending members!</Typography>
      )}
      <Typography variant="h6" textAlign={"center"}>
        Active Members
      </Typography>
      {active_members.length ? (
        active_members.map((x, i) => (
          <Grid container width={"85%"} key={i} margin={"0 auto"} spacing={2} columnSpacing={4}>
            <Grid item xs={3} justifyContent={"center"}>
              <ActiveMember project_id={project_id} user_id={x.user_id} />
            </Grid>
          </Grid>
        ))
      ) : (
        <Typography textAlign={"center"}>There are no active members!</Typography>
      )}
    </Stack>
  );
}

export default ProjectManage;
