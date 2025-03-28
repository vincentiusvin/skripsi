import { Button, Skeleton, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import { useParams } from "wouter";
import { API } from "../../../../../backend/src/routes.ts";
import UserCard from "../../../components/Cards/UserCard.tsx";
import {
  useFriendsDelete,
  useFriendsDetailGet,
  useFriendsGet,
  useFriendsPut,
} from "../../../queries/friend_hooks.ts";
import AuthorizeUser from "../AuthorizeUser.tsx";

type FriendStatus = API["UsersDetailFriendsDetailGet"]["ResBody"]["status"];

const StatusMapping: Record<FriendStatus, string> = {
  Pending: "Pending",
  Accepted: "Teman",
  Sent: "Dikirim",
  None: "-",
};

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
                <Grid
                  key={m.user_id}
                  justifyContent={"center"}
                  size={{
                    xs: 12,
                    md: 4,
                    lg: 3,
                  }}
                >
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
            <Typography textAlign={"center"}>Tidak ada {x.name.toLocaleLowerCase()}!</Typography>
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
      subtitle={friend_data != undefined ? StatusMapping[friend_data.status] : undefined}
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

function UserFriendsPage() {
  const { id } = useParams();
  const user_id = Number(id);

  return (
    <AuthorizeUser self={true}>
      <UserFriends user_id={user_id} />
    </AuthorizeUser>
  );
}

export default UserFriendsPage;
