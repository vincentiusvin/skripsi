import { DarkMode, LightMode, Login, Logout } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { AppBar, Box, Button, IconButton, Toolbar, Typography } from "@mui/material";
import { useAppTheme } from "../helpers/theme.ts";
import { useSessionDelete, useSessionGet } from "../queries/sesssion_hooks.ts";
import NotificationDialog from "./Notification.tsx";
import ProgressLine from "./ProgressLine.tsx";
import StyledLink from "./StyledLink.tsx";
import UserLabel from "./UserLabel.tsx";

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
          <IconButton variant="outlined" onClick={() => setDrawerOpen(!drawerOpen)}>
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
                <UserLabel user_id={data.user_id} disableName />
              </Button>
            </StyledLink>
            {data?.logged ? <NotificationDialog user_id={data.user_id} /> : null}
            <IconButton
              variant="outlined"
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
          <IconButton onClick={() => setTheme("light")} variant="outlined">
            <LightMode />
          </IconButton>
        ) : (
          <IconButton onClick={() => setTheme("dark")} variant="outlined">
            <DarkMode />
          </IconButton>
        )}
      </Toolbar>
      <ProgressLine />
    </AppBar>
  );
}

export default Navigation;
