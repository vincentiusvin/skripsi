import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Stack,
} from "@mui/material";
import dayjs from "dayjs";
import { useContributionsDetailGet } from "../../queries/contribution_hooks.ts";
import ContributionChip from "../../routes/Contributions/components/ContributionChip.tsx";
import StyledLink from "../StyledLink.tsx";
import UserLabel from "../UserLabel.tsx";

function ContribList(props: { contribution_id: number; hideStatus?: boolean }) {
  const { contribution_id, hideStatus } = props;
  const { data: contrib } = useContributionsDetailGet({
    contribution_id,
  });

  if (contrib == undefined) {
    return <Skeleton />;
  }

  return (
    <StyledLink to={`/contributions/${contrib.id}`} key={contrib.id}>
      <ListItem disableGutters>
        <ListItemButton>
          <ListItemText
            primary={contrib.name}
            secondary={dayjs(contrib.created_at).format("ddd[,] D[/]M[/]YY HH:mm")}
          />
          <ListItemIcon>
            <Stack direction="row" spacing={2} alignItems={"center"}>
              {contrib.user_ids.map((y) => (
                <UserLabel user_id={y.user_id} key={y.user_id} />
              ))}
              {!hideStatus ? <ContributionChip status={contrib.status} /> : null}
            </Stack>
          </ListItemIcon>
        </ListItemButton>
      </ListItem>
    </StyledLink>
  );
}

export default ContribList;
