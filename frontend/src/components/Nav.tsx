import { Login, Logout } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { Avatar, Box, Button, Menu, MenuItem, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { Link } from "wouter";
import { useSessionDelete, useSessionGet } from "../queries/sesssion_hooks";
import { useUsersDetailGet } from "../queries/user_hooks";

function UserImage(props: { user_id: number }) {
  const { user_id } = props;
  const { data: userDetail } = useUsersDetailGet({
    user_id,
  });
  return (
    <Avatar
      src={userDetail?.user_image ?? ""}
      sx={{
        width: 36,
        height: 36,
      }}
    />
  );
}

function Nav() {
  const { data } = useSessionGet();
  const { mutate: logout } = useSessionDelete();
  const [drawerAnchor, setDrawerAnchor] = useState<HTMLElement | undefined>();
  const navButtons = [
    {
      name: "Home",
      link: "/",
      disabled: false,
    },
    {
      name: "Orgs",
      link: "/orgs",
      disabled: false,
    },
    {
      name: "Projects",
      link: "/projects",
      disabled: false,
    },
    {
      name: "Chatroom",
      link: "/chatroom",
      disabled: !data?.logged,
    },
  ];

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
      <Stack
        direction={"row"}
        spacing={5}
        sx={{
          display: {
            xs: "none",
            md: "flex",
          },
        }}
      >
        {navButtons.map((x) => (
          <Link to={x.link} asChild key={x.name}>
            <Button disabled={x.disabled}>{x.name}</Button>
          </Link>
        ))}
      </Stack>
      <Box
        sx={{
          display: {
            md: "none",
          },
        }}
      >
        <Button onClick={(e) => setDrawerAnchor(e.currentTarget)} variant="outlined">
          <MenuIcon />
        </Button>
        <Menu
          open={drawerAnchor != undefined}
          onClose={() => setDrawerAnchor(undefined)}
          anchorEl={drawerAnchor}
        >
          {navButtons.map((x) => (
            <Link to={x.link} key={x.name}>
              <MenuItem disabled={x.disabled}>
                <Typography
                  variant="h6"
                  sx={{
                    textDecoration: "none",
                    color: "primary",
                  }}
                >
                  {x.name}
                </Typography>
              </MenuItem>
            </Link>
          ))}
        </Menu>
      </Box>
      <Stack direction={"row"} spacing={2} alignItems={"center"} justifyContent={"space-between"}>
        {data?.logged ? (
          <>
            <Box
              sx={{
                display: {
                  xs: "none",
                  md: "block",
                },
              }}
            >
              <Typography>Hello, {data.user_name}</Typography>
            </Box>
            <Link to={`/users/${data.user_id}`}>
              <Button>
                <UserImage user_id={data.user_id} />
              </Button>
            </Link>
            <Button
              sx={{
                display: {
                  xs: "inline-flex",
                  md: "none",
                },
              }}
              color="primary"
              variant="outlined"
              onClick={() => logout()}
            >
              <Logout />
            </Button>
            <Button
              sx={{
                display: {
                  xs: "none",
                  md: "inline-flex",
                },
              }}
              variant="outlined"
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
