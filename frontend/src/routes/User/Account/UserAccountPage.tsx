import { ArrowBack, Update } from "@mui/icons-material";
import { Avatar, Button, Grid, Paper, TextField, Typography } from "@mui/material";
import { Link, useLocation, useParams } from "wouter";
import { APIError } from "../../../helpers/fetch";
import { useUserAccountDetailGet } from "../../../queries/user_hooks";

function UserAccountPage() {
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
            <Typography variant="h2" color="#6A81FC">
              <Link to={"/"} style={{ textDecoration: "none", color: "inherit" }}>
                Account
              </Link>
            </Typography>
            <Typography variant="h2">Contribution</Typography>
            <Typography variant="h2">Connections</Typography>
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
              <Typography>
                Username:
                <TextField
                  required
                  id="filled-required"
                  variant="standard"
                  defaultValue={data.user_name}
                />
              </Typography>
            </Grid>
            <Grid item>
              <Typography>
                Password:
                <TextField
                  required
                  id="filled-password-input"
                  label="Required"
                  type="password"
                  autoComplete="current-password"
                  variant="standard"
                  defaultValue={data.user_password}
                />
              </Typography>
            </Grid>
            <Grid item>
              <Typography>
                Email:
                <TextField
                  required
                  id="outlined_required"
                  label="Required"
                  variant="standard"
                  defaultValue={data.user_email}
                />
              </Typography>
            </Grid>
            <Grid item>
              <Typography>
                Education-level:
                <TextField variant="standard" defaultValue={data.user_education_level} />
              </Typography>
            </Grid>
            <Grid item>
              <Typography>
                School:
                <TextField variant="standard" defaultValue={data.user_school} />
              </Typography>
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
              <Typography>About Me</Typography>
              <TextField variant="standard" defaultValue={data.user_education_level} />
            </Grid>
          </Paper>

          <Grid item xs={8} paddingTop="2vw">
            <Link to={""}>
              <Button endIcon={<Update />} variant="contained" fullWidth>
                Update
              </Button>
            </Link>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default UserAccountPage;
