import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Fragment, useState } from "react";
import { useLocation, useParams } from "wouter";
import { APIError } from "../../helpers/fetch.ts";
import { useProjectsDetailGet } from "../../queries/project_hooks.ts";
import { useUsersGet } from "../../queries/user_hooks.ts";
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

function ProjectPeople(props: { project_id: number }) {
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

  const memberTypes = [
    {
      members: pending_members,
      deleteOption: {
        text: "Reject",
      },
      putOption: {
        text: "Approve",
        role: "Dev",
      },
      name: "Anggota Pending",
    },
    {
      members: active_members,
      deleteOption: {
        text: "Remove",
      },
      putOption: undefined,
      name: "Anggota Aktif",
    },
    {
      members: invited_members,
      deleteOption: {
        text: "Cancel",
      },
      putOption: undefined,
      name: "Anggota Diundang",
    },
  ] as const;

  return (
    <Stack gap={2}>
      <InviteMembersDialog project_id={project_id} />
      {memberTypes.map((x, i) => (
        <Fragment key={i}>
          <Typography variant="h6" textAlign={"center"}>
            {x.name}
          </Typography>
          {x.members.length ? (
            <Grid container width={"85%"} margin={"0 auto"} spacing={2} columnSpacing={4}>
              {x.members.map((m) => (
                <Grid
                  key={m.user_id}
                  justifyContent={"center"}
                  size={{
                    xs: 12,
                    md: 4,
                    lg: 3,
                  }}
                >
                  <ProjectMember
                    deleteOption={x.deleteOption}
                    putOption={x.putOption}
                    project_id={project_id}
                    user_id={m.user_id}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography textAlign={"center"}>Tidak ada {x.name.toLocaleLowerCase()}!</Typography>
          )}
        </Fragment>
      ))}
    </Stack>
  );
}

function ProjectsPeoplePage() {
  const { project_id: id } = useParams();
  const [, setLocation] = useLocation();

  if (id === undefined) {
    setLocation("/projects");
  }
  const project_id = Number(id);

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

  return <ProjectPeople project_id={project_id} />;
}

export default ProjectsPeoplePage;
