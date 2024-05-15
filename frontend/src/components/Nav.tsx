import { Login, Logout } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/material";
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
      paddingY={2}
      paddingX={4}
      color={"primary.main"}
      alignItems={"center"}
      justifyContent={"space-between"}
    >
      <Stack direction={"row"} spacing={5}>
        <Link to={"/"}>
          <Button>Home</Button>
        </Link>
        <Link to={"/orgs"}>
          <Button>Orgs</Button>
        </Link>
      </Stack>
      <Stack
        direction={"row"}
        spacing={2}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Box>
          <Typography>Hello, {data?.user_name}</Typography>
        </Box>
        {data?.logged ? (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Logout />}
            onClick={() => logout()}
          >
            Log Out
          </Button>
        ) : (
          <Link to={"/auth"}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Login />}
              onClick={() => logout()}
            >
              Log In
            </Button>
          </Link>
        )}
      </Stack>
    </Stack>
  );
}

export default Nav;
