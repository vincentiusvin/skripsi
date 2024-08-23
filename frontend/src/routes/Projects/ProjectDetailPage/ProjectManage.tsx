import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useProjectsDetailGet } from "../../../queries/project_hooks.ts";
import { useUsersGet } from "../../../queries/user_hooks.ts";
import ProjectMember from "./ProjectMemberComponent.tsx";

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
                <ProjectMember
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
              <ProjectMember
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
              <ProjectMember
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
              <ProjectMember
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
