import { Box, Button, TextField } from "@mui/material";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import { useState } from "react";
import useSWRMutation from "swr/mutation";
import { useLocation } from "wouter";
import Nav from "../components/Nav";
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

  const { trigger: register } = useSWRMutation(
    ["/api/user", username, password],
    ([url, username, password]) =>
      new APIContext("PostUser").fetch(url, {
        method: "POST",
        body: {
          user_name: username,
          user_password: password,
        },
      })
  );

  function onSuccess() {
    const redirectTimeout = setTimeout(() => {
      setLocation("/");
    }, 5000);
    enqueueSnackbar({
      message:
        "Login success! You will be redirected to the home page in five seconds...",
      action: (id) => (
        <Button
          onClick={() => {
            closeSnackbar(id);
            clearTimeout(redirectTimeout);
          }}
        >
          Cancel
        </Button>
      ),
      variant: "success",
    });
  }

  return (
    <Box>
      <Nav />
      <TextField
        onChange={(e) => setUsername(e.target.value)}
        label="Username"
        sx={{ display: "block" }}
      ></TextField>
      <TextField
        onChange={(e) => setPassword(e.target.value)}
        label="Password"
        sx={{ display: "block" }}
      ></TextField>
      <Button onClick={() => login().then(onSuccess)}>Login</Button>
      <Button onClick={() => register()}>Register</Button>
    </Box>
  );
}

export default AuthPage;
