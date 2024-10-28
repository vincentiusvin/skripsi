import { Divider, ListItemButton, Skeleton, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import dayjs from "dayjs";
import { useParams } from "wouter";
import ProjectCard from "../../../components/Cards/ProjectCard.tsx";
import StyledLink from "../../../components/StyledLink.tsx";
import UserLabel from "../../../components/UserLabel.tsx";
import { useContributionsDetailGet } from "../../../queries/contribution_hooks.ts";
import { useSessionGet } from "../../../queries/sesssion_hooks.ts";
import ContributionInvolved from "./ContributionInvolved.tsx";

function ContributionDetail(props: { contribution_id: number }) {
  const { contribution_id } = props;
  const { data: contrib } = useContributionsDetailGet({
    contribution_id,
  });
  const { data: session } = useSessionGet();

  if (!contrib) {
    return <Skeleton />;
  }

  const user_id: number | undefined = session?.logged ? session.user_id : undefined;

  return (
    <Grid container spacing={2}>
      <Grid
        size={{
          xs: 12,
          sm: 9,
        }}
      >
        <Typography variant="h4" textAlign="center" fontWeight={"bold"}>
          {contrib.name}
        </Typography>
        <Typography variant="caption" textAlign="center" display="block">
          {dayjs(contrib.created_at).format("ddd[,] D[/]M[/]YY HH:mm")}
        </Typography>
        <Divider
          sx={{
            marginY: 2,
          }}
        />
        <Typography textAlign="center">{contrib.description}</Typography>
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 3,
        }}
      >
        <Stack spacing={2} divider={<Divider />}>
          {user_id != undefined ? (
            <ContributionInvolved
              status={contrib.status}
              contribution_users={contrib.user_ids.map((x) => x.user_id)}
              user_id={user_id}
              contribution_id={contribution_id}
              project_id={contrib.project_id}
            />
          ) : null}
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight={"bold"}>
              Kontributor
            </Typography>
            {contrib.user_ids.map((x) => (
              <StyledLink to={`/users/${x.user_id}`} key={x.user_id}>
                <ListItemButton>
                  <UserLabel user_id={x.user_id} />
                </ListItemButton>
              </StyledLink>
            ))}
          </Stack>
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight={"bold"}>
              Proyek
            </Typography>
            <ProjectCard project_id={contrib.project_id} />
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
}

function ContributionDetailPage() {
  const { contribution_id: id } = useParams();
  const contribution_id = Number(id);

  return <ContributionDetail contribution_id={contribution_id} />;
}

export default ContributionDetailPage;
