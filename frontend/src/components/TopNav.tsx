import { DarkMode, LightMode, Login, Logout } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { AppBar, Avatar, Box, Button, IconButton, Toolbar, Typography } from "@mui/material";
import { useAppTheme } from "../helpers/theme.ts";
import { useSessionDelete, useSessionGet } from "../queries/sesssion_hooks.ts";
import { useUsersDetailGet } from "../queries/user_hooks.ts";
import NotificationDialog from "./Notification.tsx";
import ProgressLine from "./ProgressLine.tsx";
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

function Navigation(props: { drawerOpen: boolean; setDrawerOpen: (x: boolean) => void }) {
  const { drawerOpen, setDrawerOpen } = props;
  const { data } = useSessionGet();
  const { mutate: logout } = useSessionDelete();
  const [theme, setTheme] = useAppTheme();

  return (
    <AppBar
      position="sticky"
      variant="elevation"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          gap: {
            xs: 1,
            sm: 2,
          },
          paddingY: 2,
          paddingX: {
            md: 4,
            xs: 2,
          },
        }}
      >
        <Box
          sx={{
            display: {
              md: "none",
            },
          }}
        >
          <IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
            <MenuIcon />
          </IconButton>
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
      <ProgressLine />
    </AppBar>
  );
}

export default Navigation;
