import { Email, School } from "@mui/icons-material";
import { Avatar, Paper, Skeleton, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useLocation } from "wouter";
import { APIError } from "../../../../helpers/fetch.ts";
import { useUsersDetailGet } from "../../../../queries/user_hooks.ts";
import UserFriendList from "./UserProfileFriend.tsx";
import FriendShortcut from "./UserProfileManageFriend.tsx";
import UserOrgsList from "./UserProfileOrgs.tsx";
import UserProjectsList from "./UserProfileProjects.tsx";

function UserProfile(props: { viewed_id: number; our_id?: number }) {
  const { viewed_id, our_id } = props;

  const [, setLocation] = useLocation();
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

  if (!userDetail) {
    return <Skeleton />;
  }

  return (
    <Grid container rowGap={2}>
      <Grid
        size={{
          xs: 12,
          md: 4,
        }}
      >
        <Stack alignItems={"center"} spacing={2}>
          <Avatar src={userDetail.user_image ?? ""} sx={{ width: 256, height: 256 }}></Avatar>
          {our_id != undefined ? (
            <FriendShortcut our_user_id={our_id} viewed_user_id={userDetail.user_id} />
          ) : null}
          <UserFriendList user_id={viewed_id} />
          <UserProjectsList user_id={viewed_id} />
          <UserOrgsList user_id={viewed_id} />
        </Stack>
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 8,
        }}
      >
        <Stack gap={4}>
          <Paper
            sx={{
              px: 4,
              py: 2,
              backgroundColor: (theme) => (theme.palette.mode === "dark" ? "#1A2027" : "#fff"),
            }}
          >
            <Typography variant="h4" fontWeight={"bold"}>
              {userDetail.user_name}
            </Typography>
            <Stack direction="row" gap={2}>
              <Email />
              {
                <Typography variant="body1">
                  {userDetail.user_email ? userDetail.user_email : "Belum ada informasi"}
                </Typography>
              }
            </Stack>
            <Stack direction="row" gap={2}>
              <School />
              <Typography variant="body1">
                {userDetail.user_education_level ? (
                  <Typography component={"span"} sx={{ textDecoration: "underline" }}>
                    {userDetail.user_education_level}
                  </Typography>
                ) : null}
                {userDetail.user_education_level && userDetail.user_school ? " di " : null}
                {userDetail.user_school ? (
                  <Typography component={"span"} sx={{ textDecoration: "underline" }}>
                    {userDetail.user_school}
                  </Typography>
                ) : null}
                {!userDetail.user_education_level && !userDetail.user_school
                  ? "Belum ada informasi"
                  : null}
              </Typography>
            </Stack>
          </Paper>
          <Paper
            sx={{
              px: 4,
              py: 2,
              backgroundColor: (theme) => (theme.palette.mode === "dark" ? "#1A2027" : "#fff"),
            }}
          >
            <Typography variant="h6" fontWeight={"bold"} textAlign={"center"}>
              Tentang
            </Typography>
            <Typography>
              {userDetail.user_about_me ? userDetail.user_about_me : "Belum ada informasi"}
            </Typography>
          </Paper>
        </Stack>
      </Grid>
    </Grid>
  );
}

export default UserProfile;
