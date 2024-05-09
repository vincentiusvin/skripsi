import { Box, Button, Stack } from "@mui/material";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { Link } from "wouter";
import { APIContext } from "../helpers/fetch";

function Nav() {
  const { data } = useSWR("/api/session", new APIContext("GetSession").fetch);
  const { trigger: logout } = useSWRMutation("/api/session", (url) =>
    new APIContext("PutSession").fetch(url, {
      method: "DELETE",
    })
  );

  return (
    <Stack
      direction={"row"}
      spacing={2}
      alignItems={"center"}
      justifyContent={"space-between"}
    >
      <Box>Hello, {data?.user_name}</Box>
      {data?.logged ? (
        <Button onClick={() => logout()}>Logout</Button>
      ) : (
        <Link to={"/auth"}>Login</Link>
      )}
    </Stack>
  );
}

export default Nav;
