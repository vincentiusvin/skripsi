import { Button, Grid, Skeleton, Stack, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import UserCard from "../../../components/UserCard.tsx";
import {
  useFriendsDelete,
  useFriendsDetailGet,
  useFriendsGet,
  useFriendsPut,
} from "../../../queries/friend_hooks.ts";

function UserFriends(props: { user_id: number }) {
  const { user_id } = props;
  const { data: friends } = useFriendsGet({ user_id });

  if (!friends) {
    return <Skeleton />;
  }

  const outgoing = friends.filter((x) => x.status === "Sent");
  const incoming = friends.filter((x) => x.status === "Pending");
  const accepted = friends.filter((x) => x.status === "Accepted");

  return (
    <Stack gap={2}>
      <Typography variant="h6" textAlign={"center"}>
        Permintaan Masuk
      </Typography>
      {incoming.length ? (
        incoming.map((x, i) => (
          <Grid key={i} container width={"85%"} margin={"0 auto"} spacing={2} columnSpacing={4}>
            <Grid item xs={3} justifyContent={"center"}>
              <FriendManage
                deleteOption={{
                  text: "Tolak",
                }}
                putOption={{
                  text: "terima",
                  status: "Accepted",
                }}
                user_id={user_id}
                with_id={x.user_id}
              />
            </Grid>
          </Grid>
        ))
      ) : (
        <Typography textAlign={"center"}>Tidak ada permintaan yang masuk!</Typography>
      )}
      <Typography variant="h6" textAlign={"center"}>
        Permintaan Terkirim
      </Typography>
      {outgoing.length ? (
        outgoing.map((x, i) => (
          <Grid container width={"85%"} key={i} margin={"0 auto"} spacing={2} columnSpacing={4}>
            <Grid item xs={3} justifyContent={"center"}>
              <FriendManage
                deleteOption={{
                  text: "Batal",
                }}
                user_id={user_id}
                with_id={x.user_id}
              />
            </Grid>
          </Grid>
        ))
      ) : (
        <Typography textAlign={"center"}>Tidak ada permintaan yang terkirim!</Typography>
      )}
      <Typography variant="h6" textAlign={"center"}>
        Teman
      </Typography>
      {accepted.length ? (
        accepted.map((x, i) => (
          <Grid container width={"85%"} key={i} margin={"0 auto"} spacing={2} columnSpacing={4}>
            <Grid item xs={3} justifyContent={"center"}>
              <FriendManage
                deleteOption={{
                  text: "Hapus",
                }}
                user_id={user_id}
                with_id={x.user_id}
              />
            </Grid>
          </Grid>
        ))
      ) : (
        <Typography textAlign={"center"}>Tidak ada permintaan yang keluar!</Typography>
      )}
    </Stack>
  );
}

function FriendManage(props: {
  user_id: number;
  with_id: number;
  deleteOption?: {
    text: string;
  };
  putOption?: {
    text: string;
    status: "Accepted" | "Sent";
  };
}) {
  const { user_id, with_id, deleteOption, putOption } = props;
  const { data: friend_data } = useFriendsDetailGet({ user_id, with_id });

  const { mutate: putFriend } = useFriendsPut({
    user_id,
    with_id,
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Permintaan dikirim!</Typography>,
        variant: "success",
      });
    },
  });

  const { mutate: deleteFriend } = useFriendsDelete({
    user_id,
    with_id,
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Permintaan dihapus!</Typography>,
        variant: "success",
      });
    },
  });

  return (
    <UserCard
      user_id={with_id}
      subtitle={friend_data?.status}
      sidebar={
        <>
          {putOption && (
            <Button
              variant="outlined"
              onClick={() => {
                putFriend({
                  status: putOption.status,
                });
              }}
            >
              {putOption.text}
            </Button>
          )}
          {deleteOption && (
            <Button
              variant="outlined"
              onClick={() => {
                deleteFriend();
              }}
            >
              {deleteOption.text}
            </Button>
          )}
        </>
      }
    />
  );
}

export default UserFriends;
