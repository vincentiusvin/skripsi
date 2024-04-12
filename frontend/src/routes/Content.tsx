import { Button, TextField } from "@mui/material";
import { useState } from "react";
import useSWRMutation from "swr/mutation";
import Nav from "../components/Nav";
import { APIContext } from "../helpers/fetch";

function Content() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { trigger: login } = useSWRMutation("/api/session", (url) =>
    new APIContext("PutSession").fetch(url, {
      method: "PUT",
      body: {
        user_name: username,
        user_password: password,
      },
    })
  );

  const { trigger: logout } = useSWRMutation("/api/session", (url) =>
    new APIContext("PutSession").fetch(url, {
      method: "DELETE",
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

  return (
    <>
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
      <Button onClick={() => login()}>Login</Button>
      <Button onClick={() => register()}>Register</Button>
      <Button onClick={() => logout()}>Logout</Button>
    </>
  );
}

export default Content;
