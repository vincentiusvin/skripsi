import { ArrowBack } from "@mui/icons-material";
import { Avatar, Button, Grid, Typography } from "@mui/material";
import { Link, useLocation, useParams } from "wouter";
import { APIError } from "../../helpers/fetch";
import { useUserAccountDetailGet } from "../../queries/user_hooks";

function UserContributionPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data } = useUserAccountDetailGet({
    user_id: Number(id),
    retry: (failureCount, error) => {
      if ((error instanceof APIError && error.status == 404) || failureCount > 3) {
        setLocation("/");
        return false;
      }
      return true;
    },
  });
  if (data) {
    return (
      <Grid container mt={2}>
        <Grid item xs={1}>
          <Link to={"/"}>
            <Button startIcon={<ArrowBack />} variant="contained" fullWidth>
              Go Back
            </Button>
          </Link>
        </Grid>
        <Grid item xs paddingTop="10vw">
          <Grid item xs={1}>
            <Avatar src="" sx={{ width: "20vw", height: "20vw" }}></Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h2">
              <Link
                to={`/user/${data.user_id}/account`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Account
              </Link>
            </Typography>
            <Typography variant="h2" color="#6A81FC">
              <Link
                to={`/user/${data.user_id}/contribution`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Contribution
              </Link>
            </Typography>
            <Typography variant="h2">
              <Link to={"/"} style={{ textDecoration: "none", color: "inherit" }}>
                Connections
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}
export default UserContributionPage;
