import { ThemeProvider } from "@emotion/react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  CssBaseline,
  Divider,
  IconButton,
  Typography,
  createTheme,
} from "@mui/material";
import { SnackbarProvider, closeSnackbar, enqueueSnackbar } from "notistack";
import { SWRConfig } from "swr";
import { Route, Switch } from "wouter";
import "./App.css";
import Nav from "./components/Nav";
import { APIError } from "./helpers/fetch";
import AuthPage from "./routes/AuthPage";
import HomePage from "./routes/HomePage";
import OrgsDetailPage from "./routes/OrgsDetailPage";
import OrgsPage from "./routes/OrgsPage";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider
        anchorOrigin={{
          horizontal: "center",
          vertical: "top",
        }}
        autoHideDuration={5000}
        action={(key) => (
          <IconButton onClick={() => closeSnackbar(key)}>
            <CloseIcon />
          </IconButton>
        )}
      >
        <SWRConfig
          value={{
            errorRetryCount: 0,
            onError: (err) => {
              if (err instanceof APIError) {
                enqueueSnackbar({
                  message: <Typography>{err.info.msg}</Typography>,
                  variant: "error",
                });
              } else if (err instanceof Error) {
                enqueueSnackbar({
                  message: <Typography>{err.message}</Typography>,
                  variant: "error",
                });
              }
            },
          }}
        >
          <CssBaseline />
          <Nav />
          <Divider />
          <Box mx={4} height={"100%"}>
            <Switch>
              <Route path={"/"} component={HomePage} />
              <Route path={"/auth"} component={AuthPage} />
              <Route path={"/orgs"} component={OrgsPage} />
              <Route path={"/orgs/:id"} component={OrgsDetailPage} />
            </Switch>
          </Box>
        </SWRConfig>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
