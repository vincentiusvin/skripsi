import { Skeleton, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import ContribList from "../../../components/Cards/ContribList.tsx";
import { useContributionsGet } from "../../../queries/contribution_hooks";

function UserContributions(props: { user_id: number }) {
  const { user_id } = props;
  const { data } = useContributionsGet({
    user_id,
    limit: 10,
    page: 1,
  });

  if (data == undefined) {
    return <Skeleton />;
  }

  return (
    <Grid container spacing={2} mt={2}>
      {data.length !== 0 ? (
        <Stack spacing={2}>
          {data.map((x) => (
            <ContribList contribution_id={x.id} key={x.id} />
          ))}
        </Stack>
      ) : (
        <Grid size={12}>
          <Typography textAlign={"center"}>
            Pengguna ini belum memiliki laporan kontribusi.
          </Typography>
        </Grid>
      )}
    </Grid>
  );
}

export default UserContributions;
