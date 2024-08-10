import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import {
  useProjectsDetailGet,
  useProjectsDetailMembersDelete,
  useProjectsDetailMembersPut,
} from "../../../queries/project_hooks.ts";
import { useUsersGet } from "../../../queries/user_hooks.ts";
import ProjectMember, { MemberRoles } from "./ProjectMemberComponent.tsx";

function MemberManage(props: {
  project_id: number;
  user_id: number;
  deleteOption?: {
    text: string;
  };
  putOption?: {
    text: string;
    role: MemberRoles;
  };
}) {
  const { project_id, user_id, deleteOption, putOption } = props;

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
        {putOption && (
          <Button
            onClick={() => {
              putMember({
                role: putOption.role,
              });
            }}
          >
            {putOption.text}
          </Button>
        )}
        {deleteOption && (
          <Button
            onClick={() => {
              deleteMember();
            }}
          >
            {deleteOption.text}
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

function InviteMembersDialog(props: { project_id: number }) {
  const { project_id } = props;
  const { data: users } = useUsersGet();
  const [inviteMembers, setInviteMembers] = useState(false);
  return (
    <>
      <Dialog open={inviteMembers} onClose={() => setInviteMembers(false)}>
        <DialogTitle>Add members</DialogTitle>
        <DialogContent>
          {users ? (
            <Stack gap={2}>
              {users.map((x) => (
                <MemberManage
                  project_id={project_id}
                  user_id={x.user_id}
                  key={x.user_id}
                  putOption={{
                    role: "Invited",
                    text: "Invite",
                  }}
                />
              ))}
            </Stack>
          ) : (
            <Skeleton />
          )}
        </DialogContent>
      </Dialog>
      <Button onClick={() => setInviteMembers(true)} variant="contained">
        Invite Members
      </Button>
    </>
  );
}

function ProjectManage(props: { project_id: number }) {
  const { project_id } = props;
  const { data: project } = useProjectsDetailGet({ project_id });

  if (!project) {
    return <Skeleton />;
  }

  const pending_members = project.project_members.filter((x) => x.role === "Pending");
  const invited_members = project.project_members.filter((x) => x.role === "Invited");
  const active_members = project.project_members.filter(
    (x) => x.role === "Admin" || x.role === "Dev",
  );

  return (
    <Stack gap={2}>
      <InviteMembersDialog project_id={project_id} />
      <Typography variant="h6" textAlign={"center"}>
        Pending Members
      </Typography>
      {pending_members.length ? (
        pending_members.map((x, i) => (
          <Grid key={i} container width={"85%"} margin={"0 auto"} spacing={2} columnSpacing={4}>
            <Grid item xs={3} justifyContent={"center"}>
              <MemberManage
                deleteOption={{
                  text: "Reject",
                }}
                putOption={{
                  text: "Approve",
                  role: "Dev",
                }}
                project_id={project_id}
                user_id={x.user_id}
              />
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
              <MemberManage
                project_id={project_id}
                user_id={x.user_id}
                deleteOption={{
                  text: "Remove",
                }}
              />
            </Grid>
          </Grid>
        ))
      ) : (
        <Typography textAlign={"center"}>There are no active members!</Typography>
      )}
      <Typography variant="h6" textAlign={"center"}>
        Invited Members
      </Typography>
      {invited_members.length ? (
        invited_members.map((x, i) => (
          <Grid container width={"85%"} key={i} margin={"0 auto"} spacing={2} columnSpacing={4}>
            <Grid item xs={3} justifyContent={"center"}>
              <MemberManage
                project_id={project_id}
                user_id={x.user_id}
                deleteOption={{
                  text: "Cancel",
                }}
              />
            </Grid>
          </Grid>
        ))
      ) : (
        <Typography textAlign={"center"}>There are no invited members!</Typography>
      )}
    </Stack>
  );
}

export default ProjectManage;
