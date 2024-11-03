import {
  ListItem,
  ListItemButton,
  Skeleton,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
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

  const responsive = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));

  if (contrib == undefined) {
    return <Skeleton />;
  }

  return (
    <StyledLink to={`/contributions/${contrib.id}`} key={contrib.id}>
      <ListItem disableGutters>
        <ListItemButton>
          <Grid container width="100%" alignItems={"center"}>
            <Grid size={4}>
              <Typography variant="body1">{contrib.name}</Typography>
              <Typography variant="caption">
                {dayjs(contrib.created_at).format("ddd[,] D[/]M[/]YY HH:mm")}
              </Typography>
            </Grid>
            <Grid size={8}>
              <Stack alignItems={"end"} spacing={1}>
                {!hideStatus ? <ContributionChip status={contrib.status} /> : null}
                <Stack
                  direction="row"
                  gap={!responsive ? 2 : 1}
                  justifyContent={"end"}
                  width={"100%"}
                  alignItems={"center"}
                  flexWrap={"wrap"}
                >
                  {contrib.user_ids.map((y) => (
                    <UserLabel disableName={responsive} user_id={y.user_id} key={y.user_id} />
                  ))}
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </ListItemButton>
      </ListItem>
    </StyledLink>
  );
}

export default ContribList;
