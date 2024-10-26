import { Skeleton, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import ContribCard from "../../../components/Cards/ContribCard.tsx";
import { useContributionsGet } from "../../../queries/contribution_hooks";

function UserContributions(props: { user_id: number }) {
  const { user_id } = props;
  const { data } = useContributionsGet({
    user_id,
  });

  if (data == undefined) {
    return <Skeleton />;
  }

  return (
    <Grid container spacing={2} mt={2}>
      {data.length !== 0 ? (
        data.map((x) => (
          <Grid
            key={x.id}
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <ContribCard contribution_id={x.id} />
          </Grid>
        ))
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
