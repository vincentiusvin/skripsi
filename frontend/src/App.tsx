import { ThemeProvider } from "@emotion/react";
import CloseIcon from "@mui/icons-material/Close";
import { Box, CssBaseline, Divider, IconButton, createTheme } from "@mui/material";
import { QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider, closeSnackbar } from "notistack";
import { Route, Switch } from "wouter";
import "./App.css";
import Nav from "./components/Nav";
import { queryClient } from "./helpers/queryclient";
import AuthPage from "./routes/AuthPage";
import HomePage from "./routes/HomePage";
import OrgsAddPage from "./routes/OrgsAddPage";
import OrgsDetailPage from "./routes/OrgsDetailPage";
import OrgsListPage from "./routes/OrgsListPage";
import ProjectDetailPage from "./routes/ProjectDetailPage";
import ProjectsAddPage from "./routes/ProjectsAddPage";
import ProjectListPage from "./routes/ProjectsListPage";

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
        <QueryClientProvider client={queryClient}>
          <CssBaseline />
          <Nav />
          <Divider />
          <Box mx={4} flexGrow={1}>
            <Switch>
              <Route path={"/"} component={HomePage} />
              <Route path={"/auth"} component={AuthPage} />
              <Route path={"/orgs"} component={OrgsListPage} />
              <Route path={"/orgs/add"} component={OrgsAddPage} />
              <Route path={"/orgs/:id"} component={OrgsDetailPage} />
              <Route path={"/projects"} component={ProjectListPage} />
              <Route path={"/projects/add"} component={ProjectsAddPage} />
              <Route path={"/projects/:id"} component={ProjectDetailPage} />
            </Switch>
          </Box>
        </QueryClientProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
