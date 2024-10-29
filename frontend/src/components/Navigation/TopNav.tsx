import { DarkMode, LightMode, Login, Logout, ViewSidebar } from "@mui/icons-material";
import { AppBar, Box, Button, IconButton, Toolbar, Typography, alpha } from "@mui/material";
import { useAppTheme } from "../../helpers/theme.ts";
import { useSessionDelete, useSessionGet } from "../../queries/sesssion_hooks.ts";
import NotificationDialog from "../Notification.tsx";
import ProgressLine from "../ProgressLine.tsx";
import StyledLink from "../StyledLink.tsx";
import UserLabel from "../UserLabel.tsx";
import { useNavigation } from "./NavigationContext.ts";

function TopNav() {
  const { data } = useSessionGet();
  const { mutate: logout } = useSessionDelete();
  const [theme, setTheme] = useAppTheme();
  const [, setNav] = useNavigation();

  return (
    <AppBar
      position="sticky"
      variant="elevation"
      elevation={0}
      sx={{
        height: 64,
        background: (theme) => alpha(theme.palette.background.default, 0.6),
        backdropFilter: "blur(8px)",
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
        <IconButton variant="outlined" onClick={() => setNav((x) => ({ ...x, open: !x.open }))}>
          <ViewSidebar />
        </IconButton>
        <StyledLink to="/landing">
          <Typography fontWeight={"bold"}>Dev4You</Typography>
        </StyledLink>
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
              <Typography>Halo, {data.user_name}</Typography>
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

export default TopNav;
