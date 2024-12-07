import { Favorite } from "@mui/icons-material";
import { Button, Skeleton } from "@mui/material";
import StyledLink from "../../../../../components/StyledLink.tsx";
import { useContributionsGet } from "../../../../../queries/contribution_hooks.ts";

function UserProfileContribs(props: { user_id: number }) {
  const { user_id } = props;
  const { data: contribs } = useContributionsGet({
    user_id,
    status: "Approved",
    limit: 1,
    page: 1,
  });

  if (!contribs) {
    return <Skeleton />;
  }

  return (
    <StyledLink to={`/users/${user_id}/contributions`}>
      <Button variant="outlined" startIcon={<Favorite />}>
        {contribs.total} kontribusi
      </Button>
    </StyledLink>
  );
}

export default UserProfileContribs;
