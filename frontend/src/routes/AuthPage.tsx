import { Button, Grid, TextField, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import useSWRMutation from "swr/mutation";
import { useLocation } from "wouter";
import { APIContext } from "../helpers/fetch";

function AuthPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [, setLocation] = useLocation();

  const { trigger: login } = useSWRMutation("/api/session", (url) =>
    new APIContext("PutSession").fetch(url, {
      method: "PUT",
      body: {
        user_name: username,
        user_password: password,
      },
    })
  );

  const { trigger: register } = useSWRMutation("/api/user", (url) =>
    new APIContext("PostUser").fetch(url, {
      method: "POST",
      body: {
        user_name: username,
        user_password: password,
      },
    })
  );

  function onSuccess() {
    enqueueSnackbar({
      message: <Typography>Login success!</Typography>,
      autoHideDuration: 5000,
      variant: "success",
    });
    setLocation("/");
  }

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
              onChange={(e) => setPassword(e.target.value)}
              label="Password"
              sx={{ display: "block" }}
            ></TextField>
          </Grid>
          <Grid item xs={6}>
            <Button fullWidth onClick={() => login().then(onSuccess)}>
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
