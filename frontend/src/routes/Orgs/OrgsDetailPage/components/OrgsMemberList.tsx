import { Divider, Skeleton, Stack, Typography } from "@mui/material";
import { useOrgDetailGet } from "../../../../queries/org_hooks.ts";
import OrgMember from "../../components/OrgMember.tsx";

function OrgsMemberList(props: { org_id: number }) {
  const { org_id } = props;
  const { data } = useOrgDetailGet({
    id: org_id,
  });

  if (!data) {
    return <Skeleton />;
  }

  const users = data.org_users.filter((x) => x.user_role === "Admin");

  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight={"bold"}>
        Pengurus ({users.length})
      </Typography>
      <Divider />
      <Stack spacing={1}>
        {users.map((x) => (
          <OrgMember key={x.user_id} user_id={x.user_id} org_id={org_id} />
        ))}
      </Stack>
    </Stack>
  );
}

export default OrgsMemberList;
