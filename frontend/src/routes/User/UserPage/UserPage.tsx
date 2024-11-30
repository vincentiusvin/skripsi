import { Edit } from "@mui/icons-material";
import { Button, Skeleton, Tab, Tabs } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useParams } from "wouter";
import StyledLink from "../../../components/StyledLink.tsx";
import { useStateSearch } from "../../../helpers/search.ts";
import { useSessionGet } from "../../../queries/sesssion_hooks.ts";
import { useUsersDetailGet } from "../../../queries/user_hooks.ts";
import UserContributionsPage from "./UserContributionsPage.tsx";
import UserFriendsPage from "./UserFriendsPage.tsx";
import UserProfilePage from "./UserProfile/UserProfilePage.tsx";

function UserAccountPage() {
  const { id } = useParams();
  const viewed_id = Number(id);

  const { data: userDetail } = useUsersDetailGet({
    user_id: viewed_id,
  });

  const { data: userLog } = useSessionGet();
  const isLogged = userDetail && userLog && userLog.logged;
  const isViewingSelf = isLogged && userLog.user_id === userDetail.user_id;

  const [_activeTab, setActiveTab] = useStateSearch("tab");
  const activeTab = _activeTab ?? "acc";

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
          <Tab label={"Kontribusi"} value="contrib" />
          {isViewingSelf ? <Tab label={"Teman"} value="conn" /> : null}
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
        {activeTab == "acc" ? <UserProfilePage /> : null}
        {activeTab === "conn" && isViewingSelf ? <UserFriendsPage /> : null}
        {activeTab === "contrib" ? <UserContributionsPage /> : null}
      </Grid>
    </Grid>
  );
}

export default UserAccountPage;
