import { Cancel, Check, People } from "@mui/icons-material";
import { Button, Stack, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import {
  useFriendsDelete,
  useFriendsDetailGet,
  useFriendsPut,
} from "../../../../../queries/friend_hooks.ts";

function FriendShortcut(props: { viewed_user_id: number; our_user_id: number }) {
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

export default FriendShortcut;
