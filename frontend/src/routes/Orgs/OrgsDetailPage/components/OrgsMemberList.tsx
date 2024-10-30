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

  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight={"bold"}>
        Pengurus
      </Typography>
      <Divider />
      <Stack spacing={1}>
        {data.org_users
          .filter((x) => x.user_role === "Admin")
          .map((x) => (
            <OrgMember key={x.user_id} user_id={x.user_id} org_id={org_id} />
          ))}
      </Stack>
    </Stack>
  );
}

export default OrgsMemberList;
