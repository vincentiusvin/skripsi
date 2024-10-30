import { Paper, Skeleton, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useParams } from "wouter";
import { useOrgDetailGet } from "../../../queries/org_hooks.ts";
import { useSessionGet } from "../../../queries/sesssion_hooks.ts";
import AuthorizeOrgs from "../components/AuthorizeOrgs.tsx";
import OrgsInfo from "./components/OrgsInfo.tsx";
import OrgsInvitePrompt from "./components/OrgsInvitePrompt.tsx";
import OrgsMemberList from "./components/OrgsMemberList.tsx";
import OrgsMembership from "./components/OrgsMembership.tsx";
import OrgsProjectList from "./components/OrgsProjectList.tsx";

function OrgsDetail(props: { org_id: number }) {
  const { org_id } = props;
  const { data } = useOrgDetailGet({
    id: org_id,
  });
  const { data: session } = useSessionGet();
  const user_id = session?.logged ? session.user_id : undefined;

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
        <OrgsInfo org_id={org_id} />
        {user_id !== undefined ? <OrgsInvitePrompt org_id={org_id} user_id={user_id} /> : null}
        {user_id !== undefined ? <OrgsMembership org_id={org_id} user_id={user_id} /> : null}
        <Typography fontWeight="bold" variant="h6" mt={2}>
          Tentang Kami
        </Typography>
        <Typography>{data.org_description ?? "Belum ada informasi"}</Typography>
      </Paper>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 9 }}>
          <OrgsProjectList org_id={org_id} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <OrgsMemberList org_id={org_id} />
        </Grid>
      </Grid>
    </Stack>
  );
}

function OrgsDetailPage() {
  const { org_id: id } = useParams();
  const org_id = Number(id);

  return (
    <AuthorizeOrgs allowedRoles={["Not Involved"]}>
      <OrgsDetail org_id={org_id} />
    </AuthorizeOrgs>
  );
}

export default OrgsDetailPage;
