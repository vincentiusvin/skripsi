import Grid from "@mui/material/Grid2";
import ContribCard from "../../../components/Cards/ContribCard.tsx";
import { useContributionsGet } from "../../../queries/contribution_hooks";

function UserContributions(props: { user_id: number }) {
  const { user_id } = props;
  const { data } = useContributionsGet({
    user_id,
  });
  return (
    <Grid container spacing={2} mt={2}>
      {data?.map((x) => (
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
      ))}
    </Grid>
  );
}

export default UserContributions;
