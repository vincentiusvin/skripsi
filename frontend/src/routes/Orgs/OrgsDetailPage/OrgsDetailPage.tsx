import { Paper, Skeleton, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useParams } from "wouter";
import { useOrgDetailGet, useOrgsDetailMembersGet } from "../../../queries/org_hooks.ts";
import { useSessionGet } from "../../../queries/sesssion_hooks.ts";
import AuthorizeOrgs from "../components/AuthorizeOrgs.tsx";

function OrgsInfo(props: { org_id: number }) {
  const { org_id } = props;
  const { data } = useOrgDetailGet({
    id: org_id,
  });

  if (!data) {
    return <Skeleton />;
  }

  return (
    <Stack spacing={4}>
      <Paper
        sx={{
          py: 2,
          px: 8,
        }}
      >
        <OrgsBasicData org_id={org_id} />
        <Typography fontWeight="bold" variant="h6" mt={2}>
          Tentang Kami
        </Typography>
        <Typography>{data.org_description ?? "Belum ada informasi"}</Typography>
      </Paper>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 9 }}>
          <OrgsProjects org_id={org_id} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <OrgsPeople org_id={org_id} />
        </Grid>
      </Grid>
    </Stack>
  );
}

function OrgsLoggedIn(props: { user_id: number; org_id: number }) {
  const { user_id, org_id } = props;
  const { data: membership } = useOrgsDetailMembersGet({
    org_id,
    user_id,
  });

  const role = membership?.role;
  if (!role) {
    return <Skeleton />;
  }

  if (role === "Admin" || role === "Not Involved") {
    return <OrgsInfo org_id={org_id} />;
  }

  if (role === "Invited") {
    return (
      <>
        <InvitedDialog user_id={user_id} org_id={org_id} />
        <OrgsInfo org_id={org_id} />;
      </>
    );
  }
}

function OrgsDetailPage() {
  const { data: user_data } = useSessionGet();
  const { org_id: id } = useParams();
  const org_id = Number(id);

  return (
    <AuthorizeOrgs allowedRoles={["Not Involved"]}>
      {user_data && user_data.logged ? (
        <OrgsLoggedIn org_id={org_id} user_id={user_data.user_id} />
      ) : (
        <OrgsInfo org_id={org_id} />
      )}
    </AuthorizeOrgs>
  );
}

export default OrgsDetailPage;
