import { Favorite } from "@mui/icons-material";
import { Button, Skeleton } from "@mui/material";
import { useContributionsGet } from "../../../../../queries/contribution_hooks.ts";

function UserProfileContribs(props: { user_id: number }) {
  const { user_id } = props;
  const { data: contribs } = useContributionsGet({
    user_id,
    status: "Approved",
  });

  if (!contribs) {
    return <Skeleton />;
  }

  return (
    <Button variant="outlined" startIcon={<Favorite />}>
      {contribs.length} kontribusi
    </Button>
  );
}

export default UserProfileContribs;
