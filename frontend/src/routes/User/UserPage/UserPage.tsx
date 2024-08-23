import { ArrowBack, Edit } from "@mui/icons-material";
import { Button, Grid, Skeleton, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { APIError } from "../../../helpers/fetch.ts";
import { useSessionGet } from "../../../queries/sesssion_hooks.ts";
import { useUsersDetailGet } from "../../../queries/user_hooks.ts";
import UserFriendList from "./UserFriend.tsx";
import UserProfile from "./UserProfile.tsx";

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
    <Grid container rowGap={2} mt={2}>
      <Grid item xs={2}>
        <Link to={"/"}>
          <Button startIcon={<ArrowBack />} variant="contained" fullWidth>
            Go Back
          </Button>
        </Link>
      </Grid>
      <Grid item xs={8}>
        <Tabs
          centered
          sx={{
            flexGrow: 1,
          }}
          value={activeTab}
          onChange={(_e, tab) => {
            setActiveTab(tab);
          }}
        >
          <Tab label={"Profil"} value="acc" />
          <Tab label={"Teman"} value="conn" />
          <Tab label={"Kontribusi"} value="contrib" />
        </Tabs>
      </Grid>
      <Grid item xs={2}>
        {isViewingSelf && (
          <Link to={`${id}/edit`}>
            <Button variant="contained" fullWidth endIcon={<Edit />}>
              Edit Profile
            </Button>
          </Link>
        )}
      </Grid>
      <Grid item xs={12}>
        {activeTab === "acc" ? (
          <UserProfile viewed_id={viewed_id} our_id={isLogged ? userLog.user_id : undefined} />
        ) : null}
        {activeTab === "conn" ? <UserFriendList user_id={viewed_id} /> : null}
      </Grid>
    </Grid>
  );
}

export default UserAccountPage;
