import { Button, Grid, TextField, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useLocation } from "wouter";
import { useSessionPut } from "../queries/sesssion_hooks";
import { useUsersPost } from "../queries/user_hooks";

function AuthPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [, setLocation] = useLocation();

  const { mutate: login } = useSessionPut(username, password, () => {
    enqueueSnackbar({
      message: <Typography>Login success!</Typography>,
      autoHideDuration: 5000,
      variant: "success",
    });
    setLocation("/");
  });

  const { mutate: register } = useUsersPost(username, password);

  return (
    <Grid container height={"100%"} alignItems={"center"}>
      <Grid item xs={6}>
        Hello
      </Grid>
      <Grid item xs={6} alignItems={"center"}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              onChange={(e) => setUsername(e.target.value)}
              label="Username"
              sx={{ display: "block" }}
            ></TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              label="Password"
              sx={{ display: "block" }}
            ></TextField>
          </Grid>
          <Grid item xs={6}>
            <Button fullWidth onClick={() => login()}>
              Login
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button fullWidth onClick={() => register()}>
              Register
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default AuthPage;
