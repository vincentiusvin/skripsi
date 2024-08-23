import { ArrowBack, Email, School } from "@mui/icons-material";
import { Avatar, Button, Grid, Paper, Skeleton, Stack, Typography } from "@mui/material";
import { Link, useLocation, useParams } from "wouter";
import { APIError } from "../../helpers/fetch";
import { useSessionGet } from "../../queries/sesssion_hooks";
import { useUsersDetailGet } from "../../queries/user_hooks";

function UserAccountPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data: userDetail } = useUsersDetailGet({
    user_id: Number(id),
    retry: (failureCount, error) => {
      if ((error instanceof APIError && error.status == 404) || failureCount > 3) {
        setLocation("/");
        return false;
      }
      return true;
    },
  });

  const { data: userLog } = useSessionGet();
  const isViewingSelf =
    userDetail && userLog && userLog.logged && userLog.user_id === userDetail.user_id;

  if (!userDetail) {
    return <Skeleton />;
  }
  return (
    <Grid container rowGap={2} mt={2}>
      <Grid item xs={2}>
        <Link to={"/"}>
          <Button startIcon={<ArrowBack />} variant="contained" fullWidth>
            Go Back
          </Button>
        </Link>
      </Grid>
      <Grid item xs={8}></Grid>
      <Grid item xs={2}>
        {isViewingSelf && (
          <Link to={`${id}/edit`}>
            <Button variant="contained" fullWidth>
              Edit Profile
            </Button>
          </Link>
        )}
      </Grid>
      <Grid item xs={6}>
        <Stack alignItems={"center"}>
          <Avatar src={userDetail.user_image ?? ""} sx={{ width: 256, height: 256 }}></Avatar>
          <Typography variant="h2" color="#6A81FC">
            <Link
              to={`/user/${userDetail.user_id}/account`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              Account
            </Link>
          </Typography>
          <Typography variant="h2">
            <Link
              to={`/user/${userDetail.user_id}/contribution`}
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
        </Stack>
      </Grid>
      <Grid item xs={6}>
        <Stack gap={4}>
          <Paper
            sx={{
              px: 4,
              py: 2,
              backgroundColor: (theme) => (theme.palette.mode === "dark" ? "#1A2027" : "#fff"),
            }}
          >
            <Typography variant="h4" fontWeight={"bold"}>
              {userDetail.user_name}
            </Typography>
            <Stack direction="row" gap={2}>
              <Email />
              {
                <Typography variant="body1">
                  {userDetail.user_email ? userDetail.user_email : "Belum ada informasi"}
                </Typography>
              }
            </Stack>
            <Stack direction="row" gap={2}>
              <School />
              <Typography variant="body1">
                {userDetail.user_education_level ? (
                  <Typography component={"span"} sx={{ textDecoration: "underline" }}>
                    {userDetail.user_education_level}
                  </Typography>
                ) : null}
                {userDetail.user_education_level && userDetail.user_school ? " di " : null}
                {userDetail.user_school ? (
                  <Typography component={"span"} sx={{ textDecoration: "underline" }}>
                    {userDetail.user_school}
                  </Typography>
                ) : null}
                {!userDetail.user_education_level && !userDetail.user_school
                  ? "Belum ada informasi"
                  : null}
              </Typography>
            </Stack>
          </Paper>
          <Paper
            sx={{
              px: 4,
              py: 2,
              backgroundColor: (theme) => (theme.palette.mode === "dark" ? "#1A2027" : "#fff"),
            }}
          >
            <Typography variant="h6" fontWeight={"bold"} textAlign={"center"}>
              Tentang
            </Typography>
            <Typography>
              {userDetail.user_about_me ? userDetail.user_about_me : "Belum ada informasi"}
            </Typography>
          </Paper>
        </Stack>
      </Grid>
    </Grid>
  );
}
export default UserAccountPage;
