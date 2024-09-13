import { Button, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useLocation } from "wouter";
import { useSessionPut } from "../queries/sesssion_hooks";
import { useUsersPost } from "../queries/user_hooks";

function AuthPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [, setLocation] = useLocation();

  const { mutate: putSession } = useSessionPut({
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Login success!</Typography>,
        autoHideDuration: 5000,
        variant: "success",
      });
      setLocation("/");
    },
  });
  const { mutate: postUsers } = useUsersPost();

  function login() {
    putSession({
      user_name: username,
      user_password: password,
    });
  }

  function register() {
    postUsers({
      user_name: username,
      user_password: password,
    });
  }

  return (
    (<Grid container height={"100%"} alignItems={"center"}>
      <Grid size={6}>Hello</Grid>
      <Grid alignItems={"center"} size={6}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <TextField
              fullWidth
              onChange={(e) => setUsername(e.target.value)}
              label="Username"
              sx={{ display: "block" }}
            ></TextField>
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              label="Password"
              sx={{ display: "block" }}
            ></TextField>
          </Grid>
          <Grid size={6}>
            <Button fullWidth onClick={() => login()}>
              Login
            </Button>
          </Grid>
          <Grid size={6}>
            <Button fullWidth onClick={() => register()}>
              Register
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>)
  );
}

export default AuthPage;
