import { Edit } from "@mui/icons-material";
import { Button, Skeleton, Stack, Tab, Tabs } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Link, Route, Switch, useParams, useRoute } from "wouter";
import StyledLink from "../../../components/StyledLink.tsx";
import { useSessionGet } from "../../../queries/sesssion_hooks.ts";
import { useUsersDetailGet } from "../../../queries/user_hooks.ts";
import AuthorizeUser from "../AuthorizeUser.tsx";
import UserContributionsPage from "./UserContributionsPage.tsx";
import UserFriendsPage from "./UserFriendsPage.tsx";
import UserProfilePage from "./UserProfile/UserProfilePage.tsx";

function UserNavbar(props: { user_id: number }) {
  const { user_id } = props;
  const { data: user } = useUsersDetailGet({
    user_id,
  });
  const { data: session } = useSessionGet();
  const [, user_params] = useRoute("/users/:user_id/*?");

  if (user == undefined) {
    return <Skeleton />;
  }

  const isViewingSelf = session?.logged && session.user_id === user.user_id;

  const suffix = user_params?.["*"];
  let activeTab: "acc" | "contrib" | "friends";
  if (suffix === "friends") {
    activeTab = "friends";
  } else if (suffix === "contributions") {
    activeTab = "contrib";
  } else {
    activeTab = "acc";
  }

  return (
    <Grid container>
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
          value={activeTab}
          sx={{
            maxWidth: "min-content",
            margin: "auto",
          }}
        >
          <Tab label={"Profil"} value="acc" LinkComponent={Link} href={`/users/${user_id}`} />
          <Tab
            label={"Kontribusi"}
            value="contrib"
            LinkComponent={Link}
            href={`/users/${user_id}/contributions`}
          />
          {isViewingSelf ? (
            <Tab
              label={"Teman"}
              value="friends"
              LinkComponent={Link}
              href={`/users/${user_id}/friends`}
            />
          ) : null}
        </Tabs>
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 2,
        }}
      >
        {isViewingSelf && (
          <StyledLink to={`/users/${user_id}/edit`}>
            <Button variant="contained" fullWidth endIcon={<Edit />}>
              Edit Profil
            </Button>
          </StyledLink>
        )}
      </Grid>
    </Grid>
  );
}

function UserRouter(props: { user_id: number }) {
  const { user_id } = props;

  return (
    <Stack spacing={2}>
      <UserNavbar user_id={user_id} />
      <Switch>
        <Route path="/users/:id/friends" component={UserFriendsPage} />
        <Route path="/users/:id/contributions" component={UserContributionsPage} />
        <Route path="/users/:id" component={UserProfilePage} />
      </Switch>
    </Stack>
  );
}

function UserRouterPage() {
  const { id } = useParams();
  const user_id = Number(id);

  return (
    <AuthorizeUser>
      <UserRouter user_id={user_id} />
    </AuthorizeUser>
  );
}

export default UserRouterPage;
