import { Login, Logout } from "@mui/icons-material";
import { Avatar, Box, Button, Stack, Typography } from "@mui/material";
import { Link } from "wouter";
import { useSessionDelete, useSessionGet } from "../queries/sesssion_hooks";
import { useUserAccountDetailGet } from "../queries/user_hooks";

function UserImage(props: { user_id: number }) {
  const { user_id } = props;
  const { data: userDetail } = useUserAccountDetailGet({
    user_id,
  });
  return (
    <Avatar
      src={userDetail?.user_image ?? ""}
      sx={{
        width: "2vw",
        height: "2vw",
      }}
    />
  );
}

function Nav() {
  const { data } = useSessionGet();
  const { mutate: logout } = useSessionDelete();

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
        <Link to={"/"} asChild>
          <Button>Home</Button>
        </Link>
        <Link to={"/orgs"} asChild>
          <Button>Orgs</Button>
        </Link>
        <Link to={"/projects"} asChild>
          <Button>Projects</Button>
        </Link>
        <Link to={"/chatroom"} asChild>
          <Button disabled={!data?.logged}>Chat</Button>
        </Link>
      </Stack>
      <Stack direction={"row"} spacing={2} alignItems={"center"} justifyContent={"space-between"}>
        {data?.logged ? (
          <>
            <Box>
              <Typography>Hello, {data.user_name}</Typography>
            </Box>
            <Link to={`/users/${data.user_id}`}>
              <Button>
                <UserImage user_id={data.user_id} />
              </Button>
            </Link>
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
