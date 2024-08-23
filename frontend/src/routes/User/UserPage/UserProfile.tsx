import { Cancel, Check, Email, People, School } from "@mui/icons-material";
import { Avatar, Button, Grid, Paper, Skeleton, Stack, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useLocation } from "wouter";
import { APIError } from "../../../helpers/fetch.ts";
import {
  useFriendsDelete,
  useFriendsDetailGet,
  useFriendsPut,
} from "../../../queries/friend_hooks.ts";
import { useUsersDetailGet } from "../../../queries/user_hooks.ts";
import UserFriendList from "./UserFriend.tsx";

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
    <Grid container>
      <Grid item xs={4}>
        <Stack alignItems={"center"} spacing={4}>
          <Avatar src={userDetail.user_image ?? ""} sx={{ width: 256, height: 256 }}></Avatar>
          {our_id != undefined ? (
            <AddFriend our_user_id={our_id} viewed_user_id={userDetail.user_id} />
          ) : null}
          <UserFriendList user_id={viewed_id} />
        </Stack>
      </Grid>
      <Grid item xs={8}>
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

function AddFriend(props: { viewed_user_id: number; our_user_id: number }) {
  const { viewed_user_id, our_user_id } = props;

  const { data: friend_data } = useFriendsDetailGet({
    user_id: our_user_id,
    with_id: viewed_user_id,
  });

  const { mutate: putFriend } = useFriendsPut({
    user_id: our_user_id,
    with_id: viewed_user_id,
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Permintaan dikirim!</Typography>,
        variant: "success",
      });
    },
  });

  const { mutate: deleteFriend } = useFriendsDelete({
    user_id: our_user_id,
    with_id: viewed_user_id,
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Permintaan dihapus!</Typography>,
        variant: "success",
      });
    },
  });

  if (!friend_data || our_user_id === viewed_user_id) {
    return null;
  }
  if (friend_data.status === "None") {
    return (
      <Button
        startIcon={<People />}
        variant="contained"
        onClick={() => {
          putFriend({
            status: "Sent",
          });
        }}
      >
        Tambahkan sebagai teman
      </Button>
    );
  } else if (friend_data.status === "Sent") {
    return (
      <Stack>
        <Typography>Permintaan teman dikirim</Typography>
        <Button
          startIcon={<Cancel />}
          variant="contained"
          onClick={() => {
            deleteFriend();
          }}
        >
          Batalkan
        </Button>
      </Stack>
    );
  } else if (friend_data.status === "Pending") {
    return (
      <Stack>
        <Typography>Permintaan teman diterima</Typography>
        <Button
          startIcon={<Check />}
          variant="contained"
          onClick={() => {
            putFriend({
              status: "Accepted",
            });
          }}
        >
          Terima
        </Button>
        <Button
          startIcon={<Cancel />}
          variant="contained"
          onClick={() => {
            deleteFriend();
          }}
        >
          Tolak
        </Button>
      </Stack>
    );
  } else if (friend_data.status === "Accepted") {
    return (
      <Stack>
        <Typography>Pengguna ini adalah teman anda</Typography>
        <Button
          startIcon={<Cancel />}
          variant="contained"
          onClick={() => {
            deleteFriend();
          }}
        >
          Hapus
        </Button>
      </Stack>
    );
  }
}

export default UserProfile;
