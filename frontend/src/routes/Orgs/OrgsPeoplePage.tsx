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
import { useParams } from "wouter";
import { useOrgDetailGet } from "../../queries/org_hooks.ts";
import { useUsersGet } from "../../queries/user_hooks.ts";
import AuthorizeOrgs from "./components/AuthorizeOrgs.tsx";
import OrgMember from "./components/OrgMember.tsx";

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
                <OrgMember
                  org_id={project_id}
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

function OrgsPeople(props: { org_id: number }) {
  const { org_id } = props;
  const { data: org } = useOrgDetailGet({ id: org_id });

  if (!org) {
    return <Skeleton />;
  }

  const invited_members = org.org_users.filter((x) => x.user_role === "Invited");
  const active_members = org.org_users.filter((x) => x.user_role === "Admin");

  const memberTypes = [
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
      <Typography variant="h4" fontWeight={"bold"} textAlign={"center"}>
        Pengurus Organisasi
      </Typography>
      <InviteMembersDialog project_id={org_id} />
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
                  <OrgMember
                    deleteOption={x.deleteOption}
                    putOption={x.putOption}
                    org_id={org_id}
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

function OrgsPeoplePage() {
  const { org_id: id } = useParams();
  const org_id = Number(id);

  return (
    <AuthorizeOrgs allowedRoles={["Admin"]}>
      <OrgsPeople org_id={org_id} />
    </AuthorizeOrgs>
  );
}

export default OrgsPeoplePage;
