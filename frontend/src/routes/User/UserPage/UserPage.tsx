  import { Edit } from "@mui/icons-material";
  import { Button, Skeleton, Tab, Tabs } from "@mui/material";
  import Grid from "@mui/material/Grid2";
  import { useState } from "react";
  import { useLocation, useParams } from "wouter";
  import StyledLink from "../../../components/StyledLink.tsx";
  import { APIError } from "../../../helpers/fetch.ts";
  import { useSessionGet } from "../../../queries/sesssion_hooks.ts";
  import { useUsersDetailGet } from "../../../queries/user_hooks.ts";
  import ContributionsListPage from "./UserContributions/UserContributionsListPage.tsx";
  import UserFriends from "./UserFriends.tsx";
  import UserProfile from "./UserProfile/UserProfile.tsx";

  function UserAccountPage() {
    const { id } = useParams();
    const [, setLocation] = useLocation();
    const viewed_id = Number(id);

    const { data: userDetail } = useUsersDetailGet({
      user_id: viewed_id,
      retry: (failureCount, error) => {
        if ((error instanceof APIError && error.status == 404) || failureCount > 3) {
          setLocation("/");
          return false;
        }
        return true;
      },
    });

    const { data: userLog } = useSessionGet();
    const isLogged = userDetail && userLog && userLog.logged;
    const isViewingSelf = isLogged && userLog.user_id === userDetail.user_id;

    const [activeTab, setActiveTab] = useState<"acc" | "conn" | "contrib">("acc");

    if (!userDetail) {
      return <Skeleton />;
    }

    return (
      <Grid container rowGap={2}>
        <Grid
          size={{
            xs: 12,
            md: 2,
          }}
        ></Grid>
        <Grid
          size={{
            xs: 12,
            md: 8,
          }}
        >
          <Tabs
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              maxWidth: "min-content",
              margin: "auto",
            }}
            value={activeTab}
            onChange={(_e, tab) => {
              setActiveTab(tab);
            }}
          >
            <Tab label={"Profil"} value="acc" />
            {isViewingSelf ? <Tab label={"Teman"} value="conn" /> : null}
            {isViewingSelf ? <Tab label={"Kontribusi"} value="contrib" /> : null}
          </Tabs>
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 2,
          }}
        >
          {isViewingSelf && (
            <StyledLink to={`${id}/edit`}>
              <Button variant="contained" fullWidth endIcon={<Edit />}>
                Edit Profil
              </Button>
            </StyledLink>
          )}
        </Grid>
        <Grid size={12}>
          {activeTab === "acc" ? (
            <UserProfile viewed_id={viewed_id} our_id={isLogged ? userLog.user_id : undefined} />
          ) : null}
          {activeTab === "conn" && isViewingSelf ? <UserFriends user_id={viewed_id} /> : null}
          {activeTab === "contrib" && isViewingSelf ? <ContributionsListPage /> : null}
        </Grid>
      </Grid>
    );
  }

  export default UserAccountPage;
