import { ThemeProvider } from "@emotion/react";
import CloseIcon from "@mui/icons-material/Close";
import { Box, CssBaseline, Divider, IconButton, createTheme } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SnackbarProvider, closeSnackbar } from "notistack";
import { Route, Switch } from "wouter";
import "./App.css";
import Nav from "./components/Nav";
import { queryClient } from "./helpers/queryclient";
import AuthPage from "./routes/AuthPage";
import HomePage from "./routes/HomePage";
import OrgsAddPage from "./routes/Orgs/OrgsAddPage";
import OrgsDetailPage from "./routes/Orgs/OrgsDetailPage";
import OrgsEditPage from "./routes/Orgs/OrgsEditPage";
import OrgsListPage from "./routes/Orgs/OrgsListPage";
import ProjectDetailPage from "./routes/Projects/ProjectDetailPage/ProjectDetailPage";
import ProjectsAddPage from "./routes/Projects/ProjectsAddPage";
import ProjectsEditPage from "./routes/Projects/ProjectsEditPage.tsx";
import ProjectListPage from "./routes/Projects/ProjectsListPage";
import UserAccountPageEdit from "./routes/User/UserEditPage.tsx";
import UserAccountPage from "./routes/User/UserPage/UserPage.tsx";
import ChatroomPage from "./routes/UserChatroom";

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
          <ReactQueryDevtools />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <CssBaseline />
            <Nav />
            <Divider />
            <Box mx={4} flexGrow={1}>
              <Switch>
                <Route path={"/"} component={HomePage} />
                <Route path={"/auth"} component={AuthPage} />
                <Route path={"/orgs"} component={OrgsListPage} />
                <Route path={"/orgs/add"} component={OrgsAddPage} />
                <Route path={"/orgs/:org_id"} component={OrgsDetailPage} />
                <Route path={"/orgs/:org_id/projects/add"} component={ProjectsAddPage} />
                <Route path={"/orgs/:id/edit"} component={OrgsEditPage} />
                <Route path={"/chatroom"} component={ChatroomPage} />
                <Route path={"/projects"} component={ProjectListPage} />
                <Route path={"/projects/:id"} component={ProjectDetailPage} />
                <Route path={"/projects/:project_id/edit"} component={ProjectsEditPage} />
                <Route path={"/users/:id"} component={UserAccountPage} />
                <Route path={"/users/:id/edit"} component={UserAccountPageEdit} />
              </Switch>
            </Box>
          </LocalizationProvider>
        </QueryClientProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
