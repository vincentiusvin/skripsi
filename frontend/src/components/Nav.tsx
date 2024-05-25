import { Login, Logout } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Link } from "wouter";
import { useLogout, useSession } from "../queries/sesssion_hooks";

function Nav() {
  const { data } = useSession();
  const { mutate: logout } = useLogout();

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
        <Link to={"/chatroom"}>
          <Button>Chat</Button>
        </Link>
        <Link to={"/projects"}>
          <Button>Projects</Button>
        </Link>
      </Stack>
      <Stack direction={"row"} spacing={2} alignItems={"center"} justifyContent={"space-between"}>
        {data?.logged ? (
          <>
            <Box>
              <Typography>Hello, {data.user_name}</Typography>
            </Box>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Logout />}
              onClick={() => logout()}
            >
              Log Out
            </Button>
          </>
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
