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

  const incoming = friends.filter((x) => x.status === "Pending");
  const outgoing = friends.filter((x) => x.status === "Sent");
  const accepted = friends.filter((x) => x.status === "Accepted");

  const friendTypes = [
    {
      members: incoming,
      deleteOption: {
        text: "Tolak",
      },
      putOption: {
        text: "terima",
        status: "Accepted",
      },
      name: "Permintaan Masuk",
    },
    {
      members: outgoing,
      deleteOption: {
        text: "Batal",
      },
      putOption: undefined,
      name: "Permintaan Terkirim",
    },
    {
      members: accepted,
      deleteOption: {
        text: "Hapus",
      },
      putOption: undefined,
      name: "Teman",
    },
  ] as const;

  return (
    <Stack gap={2}>
      {friendTypes.map((x) => (
        <>
          <Typography variant="h6" textAlign={"center"}>
            {x.name}
          </Typography>
          {x.members.length ? (
            <Grid container width={"85%"} margin={"0 auto"} spacing={2} columnSpacing={4}>
              {x.members.map((m) => (
                <Grid key={m.user_id} item xs={12} md={3} justifyContent={"center"}>
                  <FriendManage
                    deleteOption={x.deleteOption}
                    putOption={x.putOption}
                    user_id={user_id}
                    with_id={m.user_id}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography textAlign={"center"}>There are no {x.name.toLocaleLowerCase()}!</Typography>
          )}
        </>
      ))}
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
