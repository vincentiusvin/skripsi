import { Box, Skeleton, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useParams } from "wouter";
import UserCard from "../components/Cards/UserCard.tsx";
import { useContributionsDetailGet } from "../queries/contribution_hooks.ts";

function ContributionDetail(props: { contribution_id: number }) {
  const { contribution_id } = props;
  const { data: contrib } = useContributionsDetailGet({
    contribution_id,
  });

  if (!contrib) {
    return <Skeleton />;
  }

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5" textAlign="center" fontWeight={"bold"}>
          {contrib.name}
        </Typography>
        <Typography variant="caption" textAlign="center" display="block">
          {dayjs(contrib.created_at).format("ddd[,] D[/]M[/]YY HH:mm")}
        </Typography>
      </Box>
      <Stack direction="row" justifyContent="center" gap={2}>
        {contrib.contribution_users.map((x) => (
          <UserCard user_id={x.user_id} key={x.user_id} />
        ))}
      </Stack>
      <Typography textAlign="center">{contrib.description}</Typography>
    </Stack>
  );
}

function ContributionDetailPage() {
  const { contribution_id: id } = useParams();
  const contribution_id = Number(id);

  return <ContributionDetail contribution_id={contribution_id} />;
}

export default ContributionDetailPage;
