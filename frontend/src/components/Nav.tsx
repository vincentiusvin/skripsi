import {
  AccountBalance,
  Chat,
  DarkMode,
  Home,
  LightMode,
  Login,
  Logout,
  Notifications,
  Work,
} from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";
import { useAppTheme } from "../helpers/theme.ts";
import { useNotificationsGet } from "../queries/notification_hooks.ts";
import { useSessionDelete, useSessionGet } from "../queries/sesssion_hooks";
import { useUsersDetailGet } from "../queries/user_hooks";
import StyledLink from "./StyledLink.tsx";

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

function NotificationDialog(props: { user_id: number }) {
  const { user_id } = props;
  const { data: notification } = useNotificationsGet({
    user_id,
  });
  const [openNotification, setOpenNotification] = useState(false);
  return (
    <>
      <IconButton onClick={() => setOpenNotification(true)}>
        <Notifications />
      </IconButton>
      <Dialog open={openNotification} onClose={() => setOpenNotification(false)}>
        <DialogTitle>Notifikasi</DialogTitle>
        <DialogContent
          sx={{
            minWidth: {
              sm: 320,
              md: 480,
            },
          }}
        >
          {notification != undefined ? (
            <Stack direction={"column"} spacing={2}>
              {notification.map((x) => (
                <Paper
                  key={x.id}
                  sx={{
                    paddingX: 4,
                    paddingY: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={"bold"}
                    sx={{
                      wordBreak: "break-all",
                    }}
                  >
                    {x.title}
                  </Typography>
                  <Typography
                    sx={{
                      wordBreak: "break-all",
                    }}
                  >
                    {x.description}
                  </Typography>
                  <Typography variant="caption">
                    {dayjs(x.created_at).format("ddd[,] D[/]M[/]YY HH:mm")}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Skeleton />
          )}
        </DialogContent>
      </Dialog>
    </>
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
      icon: <Home />,
    },
    {
      name: "Orgs",
      link: "/orgs",
      disabled: false,
      icon: <AccountBalance />,
    },
    {
      name: "Projects",
      link: "/projects",
      disabled: false,
      icon: <Work />,
    },
    {
      name: "Chatroom",
      link: "/chatroom",
      disabled: !data?.logged,
      icon: <Chat />,
    },
  ];

  const [theme, setTheme] = useAppTheme();

  return (
    <AppBar position="static" variant="elevation" elevation={0}>
      <Toolbar
        sx={{
          gap: 2,
          paddingY: 2,
          paddingX: {
            md: 4,
            xs: 2,
          },
        }}
      >
        <Stack
          direction={"row"}
          sx={{
            display: {
              xs: "none",
              md: "flex",
            },
          }}
        >
          {navButtons.map((x) => (
            <StyledLink to={x.link} asChild key={x.name}>
              <Button disabled={x.disabled}>{x.name}</Button>
            </StyledLink>
          ))}
        </Stack>
        <Box
          sx={{
            display: {
              md: "none",
            },
          }}
        >
          <IconButton onClick={(e) => setDrawerAnchor(e.currentTarget)}>
            <MenuIcon />
          </IconButton>
          <Menu
            open={drawerAnchor != undefined}
            onClose={() => setDrawerAnchor(undefined)}
            anchorEl={drawerAnchor}
          >
            {navButtons.map((x) => (
              <StyledLink to={x.link} key={x.name}>
                <MenuItem disabled={x.disabled}>
                  <ListItemAvatar>{x.icon}</ListItemAvatar>
                  <ListItemText primary={x.name}></ListItemText>
                </MenuItem>
              </StyledLink>
            ))}
          </Menu>
        </Box>
        <Box flexGrow={1}></Box>
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
            <StyledLink to={`/users/${data.user_id}`}>
              <Button>
                <UserImage user_id={data.user_id} />
              </Button>
            </StyledLink>
            {data?.logged ? <NotificationDialog user_id={data.user_id} /> : null}
            <IconButton
              sx={{
                display: {
                  xs: "inline-flex",
                  md: "none",
                },
              }}
              onClick={() => logout()}
            >
              <Logout />
            </IconButton>
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
          <StyledLink to={"/auth"}>
            <Button variant="outlined" startIcon={<Login />} onClick={() => logout()}>
              Log In
            </Button>
          </StyledLink>
        )}
        {theme === "dark" ? (
          <IconButton onClick={() => setTheme("light")}>
            <LightMode />
          </IconButton>
        ) : (
          <IconButton onClick={() => setTheme("dark")}>
            <DarkMode />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Nav;
