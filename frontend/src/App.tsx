import CloseIcon from "@mui/icons-material/Close";
import { CssBaseline, IconButton } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SnackbarProvider, closeSnackbar } from "notistack";
import { useState } from "react";
import { Route, Switch } from "wouter";
import "./App.css";
import Navigation from "./components/Navigation/Navigation.tsx";
import { queryClient } from "./helpers/queryclient";
import { ThemeContext } from "./helpers/theme.ts";
import HandleReportsPage from "./routes/Admin/HandleReportsPage.tsx";
import ManageAccountsPage from "./routes/Admin/ManageAccountsPage.tsx";
import ChatroomForwarderPage from "./routes/ChatroomForwarder.tsx";
import ContributionDetailPage from "./routes/Contributions/ContributionDetailPage/ContributionDetailPage.tsx";
import ContributionEditPage from "./routes/Contributions/ContributionEditPage.tsx";
import ProjectsAddContributionPage from "./routes/Contributions/ProjectsAddContributionPage.tsx";
import ProjectsContributionPage from "./routes/Contributions/ProjectsContributionPage.tsx";
import DashboardPage from "./routes/DashboardPage.tsx";
import GuidePage from "./routes/Guides/GuidePage.tsx";
import LandingPage from "./routes/LandingPage.tsx";
import LoginPage from "./routes/LoginPage.tsx";
import OrgsAddPage from "./routes/Orgs/OrgsAddPage";
import OrgsDetailPage from "./routes/Orgs/OrgsDetailPage/OrgsDetailPage.tsx";
import OrgsEditPage from "./routes/Orgs/OrgsEditPage";
import OrgsLeavePage from "./routes/Orgs/OrgsLeavePage.tsx";
import OrgsListPage from "./routes/Orgs/OrgsListPage";
import OrgsManagePage from "./routes/Orgs/OrgsManagePage.tsx";
import OrgsPeoplePage from "./routes/Orgs/OrgsPeoplePage.tsx";
import ProjectInfoPage from "./routes/Projects/ProjectDetail/ProjectDetailPage.tsx";
import ProjectsActivityPage from "./routes/Projects/ProjectsActivityPage.tsx";
import ProjectsAddPage from "./routes/Projects/ProjectsAddPage";
import ProjectsChatroomPage from "./routes/Projects/ProjectsChatroomPage.tsx";
import ProjectsEditPage from "./routes/Projects/ProjectsEditPage.tsx";
import ProjectsKanbanPage from "./routes/Projects/ProjectsKanbanPage/ProjectsKanbanPage.tsx";
import ProjectsLeavePage from "./routes/Projects/ProjectsLeavePage.tsx";
import ProjectListPage from "./routes/Projects/ProjectsListPage";
import ProjectsManagePage from "./routes/Projects/ProjectsManagePage.tsx";
import ProjectsPeoplePage from "./routes/Projects/ProjectsPeoplePage.tsx";
import RegisterPage from "./routes/RegisterPage/RegisterPage.tsx";
import UserReportAddPage from "./routes/Reports/UserReportAddPage.tsx";
import UserReportDetailPage from "./routes/Reports/UserReportDetailPage.tsx";
import UserReportEditPage from "./routes/Reports/UserReportEditPage.tsx";
import UserReportPage from "./routes/Reports/UserReportPage.tsx";
import ResetPasswordPage from "./routes/ResetPasswordPage/ResetPasswordPage.tsx";
import SettingsPage from "./routes/SettingsPage.tsx";
import FindUsersPage from "./routes/User/FindUsersPage.tsx";
import UserAccountPageEdit from "./routes/User/UserEditPage/UserEditPage.tsx";
import UserAccountPage from "./routes/User/UserPage/UserPage.tsx";
import ChatroomPage from "./routes/UserChatroomPage.tsx";
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
              <Navigation>
                <Switch>
                  <Route path={"/"} component={DashboardPage} />
                  <Route path={"/landing"} component={LandingPage} />
                  <Route path={"/login"} component={LoginPage} />
                  <Route path={"/reset-password"} component={ResetPasswordPage} />
                  <Route path={"/register"} component={RegisterPage} />
                  <Route path={"/orgs"} component={OrgsListPage} />
                  <Route path={"/orgs/add"} component={OrgsAddPage} />
                  <Route path={"/orgs/:org_id"} component={OrgsDetailPage} />
                  <Route path={"/orgs/:org_id/add-projects"} component={ProjectsAddPage} />
                  <Route path={"/orgs/:org_id/manage"} component={OrgsManagePage} />
                  <Route path={"/orgs/:org_id/people"} component={OrgsPeoplePage} />
                  <Route path={"/orgs/:org_id/edit"} component={OrgsEditPage} />
                  <Route path={"/orgs/:org_id/leave"} component={OrgsLeavePage} />
                  <Route path={"/chatrooms"} component={ChatroomPage} />
                  <Route
                    path={"/chatroom-forwarder/:chatroom_id"}
                    component={ChatroomForwarderPage}
                  />
                  <Route path={"/reports/add"} component={UserReportAddPage} />
                  <Route path={"/reports/:report_id"} component={UserReportDetailPage} />
                  <Route path={"/reports/:report_id/edit"} component={UserReportEditPage} />
                  <Route path={"/reports"} component={UserReportPage} />
                  <Route path={"/projects"} component={ProjectListPage} />
                  <Route path={"/projects/:project_id"} component={ProjectInfoPage} />
                  <Route path={"/projects/:project_id/activity"} component={ProjectsActivityPage} />
                  <Route path={"/projects/:project_id/people"} component={ProjectsPeoplePage} />
                  <Route path={"/projects/:project_id/manage"} component={ProjectsManagePage} />
                  <Route path={"/projects/:project_id/leave"} component={ProjectsLeavePage} />
                  <Route path={"/projects/:project_id/edit"} component={ProjectsEditPage} />
                  <Route path={"/projects/:project_id/tasks"} component={ProjectsKanbanPage} />
                  <Route path={"/projects/:project_id/chat"} component={ProjectsChatroomPage} />
                  <Route
                    path={"/projects/:project_id/contributions"}
                    component={ProjectsContributionPage}
                  />
                  <Route
                    path={"/projects/:project_id/add-contribs"}
                    component={ProjectsAddContributionPage}
                  />
                  <Route
                    path={"/contributions/:contribution_id"}
                    component={ContributionDetailPage}
                  />
                  <Route
                    path={"/contributions/:contribution_id/edit"}
                    component={ContributionEditPage}
                  />
                  <Route path={"/users"} component={FindUsersPage} />
                  <Route path={"/users/:id"} component={UserAccountPage} />
                  <Route path={"/users/:id/edit"} component={UserAccountPageEdit} />
                  <Route path={"/admin/manage-reports"} component={HandleReportsPage} />
                  <Route path={"/admin/manage-accounts"} component={ManageAccountsPage} />
                  <Route path={"/settings"} component={SettingsPage} />
                  <Route path={"/guides/:guide"} component={GuidePage} />
                </Switch>
              </Navigation>
            </LocalizationProvider>
          </QueryClientProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;
