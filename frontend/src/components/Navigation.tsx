import { DarkMode, LightMode, Login, Logout } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { AppBar, Box, Button, IconButton, Toolbar, Typography } from "@mui/material";
import { useAppTheme } from "../helpers/theme.ts";
import { useSessionDelete, useSessionGet } from "../queries/sesssion_hooks.ts";
import NotificationDialog from "./Notification.tsx";
import ProgressLine from "./ProgressLine.tsx";
import StyledLink from "./StyledLink.tsx";
import UserImage from "./UserImage.tsx";

function Navigation() {
  const { data } = useSessionGet();
  const { mutate: logout } = useSessionDelete();

  const [theme, setTheme] = useAppTheme();

  return (
    <AppBar position="sticky" variant="elevation" elevation={0}>
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
          <IconButton>
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
            <NotificationDialog user_id={data.user_id} />
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
