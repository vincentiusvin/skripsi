import CloseIcon from "@mui/icons-material/Close";
import { Box, CssBaseline, IconButton, Stack } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SnackbarProvider, closeSnackbar } from "notistack";
import { useState } from "react";
import { Route, Switch } from "wouter";
import "./App.css";
import SideNav from "./components/SideNav.tsx";
import Navigation from "./components/TopNav.tsx";
import { queryClient } from "./helpers/queryclient";
import { ThemeContext } from "./helpers/theme.ts";
import HandleReportsPage from "./routes/Admin/HandleReportsPage.tsx";
import ManageAccountsPage from "./routes/Admin/ManageAccountsPage.tsx";
import AuthPage from "./routes/AuthPage";
import HomePage from "./routes/HomePage";
import OrgsAddPage from "./routes/Orgs/OrgsAddPage";
import OrgsDetailPage from "./routes/Orgs/OrgsDetailPage";
import OrgsEditPage from "./routes/Orgs/OrgsEditPage";
import OrgsLeavePage from "./routes/Orgs/OrgsLeavePage.tsx";
import OrgsListPage from "./routes/Orgs/OrgsListPage";
import OrgsManagePage from "./routes/Orgs/OrgsManagePage.tsx";
import OrgsPeoplePage from "./routes/Orgs/OrgsPeoplePage.tsx";
import ProjectInfoPage from "./routes/Projects/ProjectDetailPage.tsx";
import ProjectsAddPage from "./routes/Projects/ProjectsAddPage";
import ProjectsChatroomPage from "./routes/Projects/ProjectsChatroomPage.tsx";
import ProjectsEditPage from "./routes/Projects/ProjectsEditPage.tsx";
import ProjectsKanbanPage from "./routes/Projects/ProjectsKanbanPage.tsx";
import ProjectsLeavePage from "./routes/Projects/ProjectsLeavePage.tsx";
import ProjectListPage from "./routes/Projects/ProjectsListPage";
import ProjectsManagePage from "./routes/Projects/ProjectsManagePage.tsx";
import ProjectsPeoplePage from "./routes/Projects/ProjectsPeoplePage.tsx";
import UserReportAddPage from "./routes/Reports/UserReportAddPage.tsx";
import UserReportDetailPage from "./routes/Reports/UserReportDetailPage.tsx";
import UserReportEditPage from "./routes/Reports/UserReportEditPage.tsx";
import UserReportPage from "./routes/Reports/UserReportPage.tsx";
import FindUsersPage from "./routes/User/FindUsersPage.tsx";
import UserAccountPageEdit from "./routes/User/UserEditPage.tsx";
import UserAccountPage from "./routes/User/UserPage/UserPage.tsx";
import ChatroomPage from "./routes/UserChatroom.tsx";
import { darkTheme, lightTheme } from "./theme.ts";

function useColorMode() {
  const savedTheme = localStorage.getItem("mode");
  let defaultMode: "light" | "dark" = "light";
  if (savedTheme == "light" || savedTheme == "dark") {
    defaultMode = savedTheme;
  }
  const [theme, setThemeState] = useState<"light" | "dark">(defaultMode);

  function setTheme(x: "light" | "dark") {
    setThemeState(x);
    localStorage.setItem("mode", x);
  }

  return [theme, setTheme] as const;
}

function App() {
  const [theme, setTheme] = useColorMode();
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <ThemeContext.Provider value={[theme, setTheme]}>
      <ThemeProvider theme={theme === "dark" ? darkTheme : lightTheme}>
        <SnackbarProvider
          anchorOrigin={{
            horizontal: "center",
            vertical: "top",
          }}
          autoHideDuration={5000}
          action={(key) => (
            <IconButton
              sx={{
                color: "inherit",
                borderColor: "inherit",
                "&:hover": {
                  borderColor: "inherit",
                },
              }}
              onClick={() => closeSnackbar(key)}
            >
              <CloseIcon />
            </IconButton>
          )}
        >
          <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <CssBaseline />
              <Navigation drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
              <Stack direction={"row"} flexGrow={1} mt={2}>
                <Box
                  sx={{
                    display: {
                      xs: "none",
                      md: "block",
                    },
                  }}
                >
                  <SideNav />
                </Box>
                <Box
                  sx={{
                    display: {
                      md: "none",
                      xs: "block",
                    },
                  }}
                >
                  <SideNav responsive open={drawerOpen} setDrawerOpen={setDrawerOpen} />
                </Box>
                <Box flexGrow={1} paddingX={2} width={"100%"}>
                  <Switch>
                    <Route path={"/"} component={HomePage} />
                    <Route path={"/auth"} component={AuthPage} />
                    <Route path={"/orgs"} component={OrgsListPage} />
                    <Route path={"/orgs/add"} component={OrgsAddPage} />
                    <Route path={"/orgs/:org_id"} component={OrgsDetailPage} />
                    <Route path={"/orgs/:org_id/add-projects"} component={ProjectsAddPage} />
                    <Route path={"/orgs/:org_id/manage"} component={OrgsManagePage} />
                    <Route path={"/orgs/:org_id/people"} component={OrgsPeoplePage} />
                    <Route path={"/orgs/:org_id/edit"} component={OrgsEditPage} />
                    <Route path={"/orgs/:org_id/leave"} component={OrgsLeavePage} />
                    <Route path={"/chatrooms"} component={ChatroomPage} />
                    <Route path={"/reports/add"} component={UserReportAddPage} />
                    <Route path={"/reports/:report_id"} component={UserReportDetailPage} />
                    <Route path={"/reports/:report_id/edit"} component={UserReportEditPage} />
                    <Route path={"/reports"} component={UserReportPage} />
                    <Route path={"/projects"} component={ProjectListPage} />
                    <Route path={"/projects/:project_id"} component={ProjectInfoPage} />
                    <Route path={"/projects/:project_id/people"} component={ProjectsPeoplePage} />
                    <Route path={"/projects/:project_id/manage"} component={ProjectsManagePage} />
                    <Route path={"/projects/:project_id/leave"} component={ProjectsLeavePage} />
                    <Route path={"/projects/:project_id/edit"} component={ProjectsEditPage} />
                    <Route path={"/projects/:project_id/tasks"} component={ProjectsKanbanPage} />
                    <Route path={"/projects/:project_id/chat"} component={ProjectsChatroomPage} />
                    <Route path={"/users"} component={FindUsersPage} />
                    <Route path={"/users/:id"} component={UserAccountPage} />
                    <Route path={"/users/:id/edit"} component={UserAccountPageEdit} />
                    <Route path={"/manage-reports"} component={HandleReportsPage} />
                    <Route path={"/manage-accounts"} component={ManageAccountsPage} />
                  </Switch>
                </Box>
              </Stack>
            </LocalizationProvider>
          </QueryClientProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;
