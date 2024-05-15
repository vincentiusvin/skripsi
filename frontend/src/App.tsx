import CloseIcon from "@mui/icons-material/Close";
import { IconButton, Typography } from "@mui/material";
import { SnackbarProvider, closeSnackbar, enqueueSnackbar } from "notistack";
import { SWRConfig } from "swr";
import { Route, Switch } from "wouter";
import Nav from "./components/Nav";
import { APIError } from "./helpers/fetch";
import AuthPage from "./routes/AuthPage";
import HomePage from "./routes/HomePage";

function App() {
  return (
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
        <Nav />
        <Switch>
          <Route path={"/"} component={HomePage} />
          <Route path={"/auth"} component={AuthPage} />
        </Switch>
      </SWRConfig>
    </SnackbarProvider>
  );
}

export default App;
