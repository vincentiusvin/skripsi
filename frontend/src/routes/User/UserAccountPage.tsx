import { ArrowBack } from "@mui/icons-material";
import { Avatar, Box, Button, Grid, Paper, TextField, Typography } from "@mui/material";
import { Link, useLocation, useParams } from "wouter";
import { APIError } from "../../helpers/fetch";
import { useSessionGet } from "../../queries/sesssion_hooks";
import { useUserAccountDetailGet } from "../../queries/user_hooks";

function UserAccountPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data: userDetail } = useUserAccountDetailGet({
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
    userLog && userDetail && userLog.logged && userLog.user_id == userDetail.user_id;
  if (userDetail) {
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
          <Grid item xs={2} md={1}>
            <Avatar
              src={userDetail.user_image ?? ""}
              sx={{ width: "20vw", height: "20vw" }}
            ></Avatar>
          </Grid>
          {isViewingSelf && (
            <Link to={`${id}/edit`}>
              <Button>Edit Profile</Button>
            </Link>
          )}
          <Grid item xs>
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
          </Grid>
        </Grid>
        <Grid item paddingTop="10vw" paddingRight="20vw">
          <Paper
            sx={{
              p: 2,
              margin: "auto",
              maxWidth: 500,
              flexGrow: 1,
              backgroundColor: (theme) => (theme.palette.mode === "dark" ? "#1A2027" : "#fff"),
            }}
          >
            <Grid item>
              <Box display="flex" alignItems="center">
                <Typography variant="button">
                  <Box display="inline" lineHeight={1} fontSize="1.5vw" marginRight="1vw">
                    Username:
                  </Box>
                </Typography>
                <TextField
                  id="standard-read-only-input"
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="standard"
                  defaultValue={userDetail.user_name}
                />
              </Box>
            </Grid>
            <Grid item>
              <Box display="flex" alignItems="center">
                <Typography variant="button">
                  <Box display="inline" lineHeight={1} fontSize="1.5vw" marginRight="1vw">
                    Email:
                  </Box>
                </Typography>
                <TextField
                  id="standard-read-only-input"
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="standard"
                  defaultValue={userDetail.user_email}
                />
              </Box>
            </Grid>
            <Grid item>
              <Box display="flex" alignItems="center">
                <Typography variant="button">
                  <Box display="inline" lineHeight={1} fontSize="1.5vw" marginRight="1vw">
                    Education Level:
                  </Box>
                </Typography>
                <TextField
                  id="standard-read-only-input"
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="standard"
                  defaultValue={userDetail.user_education_level}
                />
              </Box>
            </Grid>
            <Grid item>
              <Box display="flex" alignItems="center">
                <Typography variant="button">
                  <Box display="inline" lineHeight={1} fontSize="1.5vw" marginRight="1vw">
                    School:
                  </Box>
                </Typography>
                <TextField
                  id="standard-read-only-input"
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="standard"
                  defaultValue={userDetail.user_school}
                />
              </Box>
            </Grid>
          </Paper>

          <Paper
            sx={{
              p: 2,
              margin: "auto",
              maxWidth: 500,
              flexGrow: 1,
              backgroundColor: (theme) => (theme.palette.mode === "dark" ? "#1A2027" : "#fff"),
              marginTop: "2vw",
            }}
          >
            <Grid item>
              <Typography variant="button">About Me</Typography>
              <br />
              <Typography>{userDetail.user_about_me}</Typography>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}
export default UserAccountPage;
