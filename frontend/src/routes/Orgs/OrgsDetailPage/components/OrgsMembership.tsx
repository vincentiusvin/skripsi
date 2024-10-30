import { Cancel, Check, Visibility } from "@mui/icons-material";
import { Box, Button, Skeleton, Typography } from "@mui/material";
import { useNavigation } from "../../../../components/Navigation/NavigationContext.ts";
import {
  useOrgsDetailMembersDelete,
  useOrgsDetailMembersGet,
  useOrgsDetailMembersPut,
} from "../../../../queries/org_hooks.ts";

function OrgsMembership(props: { user_id: number; org_id: number }) {
  const { org_id, user_id } = props;
  const { data: member } = useOrgsDetailMembersGet({
    org_id,
    user_id,
  });
  const { mutate: acceptInvite } = useOrgsDetailMembersPut({
    org_id,
    user_id,
  });

  const { mutate: rejectInvite } = useOrgsDetailMembersDelete({
    org_id,
    user_id,
  });
  const [nav, setNav] = useNavigation();

  if (member == undefined) {
    return <Skeleton />;
  }

  if (member.role === "Admin") {
    return (
      <Box mt={2}>
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

  if (member.role === "Invited") {
    return (
      <Box mt={2}>
        <Typography>Anda diundang untuk menjadi pengurus organisasi ini.</Typography>
        <Button
          color="success"
          variant="contained"
          startIcon={<Check />}
          onClick={() => {
            acceptInvite({
              role: "Admin",
            });
          }}
        >
          Terima
        </Button>
        <Button
          color="error"
          variant="contained"
          startIcon={<Cancel />}
          onClick={() => {
            rejectInvite();
          }}
        >
          Tolak
        </Button>
      </Box>
    );
  }
}

export default OrgsMembership;
