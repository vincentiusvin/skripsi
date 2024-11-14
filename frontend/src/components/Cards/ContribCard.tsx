import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useContributionsDetailGet } from "../../queries/contribution_hooks.ts";
import StyledLink from "../StyledLink.tsx";
import UserAvatar from "../UserAvatar.tsx";

function ContribCard(props: { contribution_id: number }) {
  const { contribution_id } = props;
  const { data: contrib_data } = useContributionsDetailGet({
    contribution_id,
  });

  if (contrib_data == undefined) {
    return <Skeleton />;
  }

  return (
    <Card>
      <StyledLink to={`/contributions/${contribution_id}`}>
        <CardActionArea>
          <CardContent>
            <Typography fontWeight={"bold"} variant="h6">
              {contrib_data.name}
            </Typography>
            <Typography>{contrib_data.description}</Typography>
          </CardContent>
        </CardActionArea>
      </StyledLink>
      <CardActions>
        <Stack direction="row" spacing={1}>
          {contrib_data.user_ids.map((x) => (
            <StyledLink key={x.user_id} to={`/users/${x.user_id}`}>
              <UserAvatar
                sx={{
                  width: 32,
                  height: 32,
                }}
                user_id={x.user_id}
              />
            </StyledLink>
          ))}
        </Stack>
      </CardActions>
    </Card>
  );
}

export default ContribCard;
