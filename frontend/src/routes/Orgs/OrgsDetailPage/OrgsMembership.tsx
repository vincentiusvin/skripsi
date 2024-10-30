import { Visibility } from "@mui/icons-material";
import { Box, Button, Skeleton, Typography } from "@mui/material";
import { useNavigation } from "../../../components/Navigation/NavigationContext.ts";
import { useOrgsDetailMembersGet } from "../../../queries/org_hooks.ts";
import { useSessionGet } from "../../../queries/sesssion_hooks.ts";

function OrgOpen(props: { user_id: number; org_id: number }) {
  const { org_id, user_id } = props;
  const { data: member } = useOrgsDetailMembersGet({
    org_id,
    user_id,
  });
  const [nav, setNav] = useNavigation();

  if (member == undefined) {
    return <Skeleton />;
  }

  if (member.role === "Admin") {
    return (
      <Box>
        <Typography>Anda merupakan anggota organisasi ini</Typography>
        <Button
          variant="contained"
          startIcon={<Visibility />}
          onClick={() => {
            setNav({
              type: "orgs",
              id: org_id,
              open: true,
            });
          }}
          disabled={nav.type === "orgs" && nav.id === org_id && nav.open}
        >
          Buka di Dashboard
        </Button>
      </Box>
    );
  }
}

function OrgOpen2(props: { org_id: number }) {
  const { org_id } = props;
  const { data: session } = useSessionGet();
  if (session == undefined) {
    return <Skeleton />;
  }

  if (session.logged) {
    return <OrgOpen org_id={org_id} user_id={session.user_id} />;
  }
  return null;
}

export default OrgOpen2;
