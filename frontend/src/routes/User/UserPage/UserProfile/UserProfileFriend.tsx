import { People } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import UserCard from "../../../../components/Cards/UserCard.tsx";
import { useFriendsGet } from "../../../../queries/friend_hooks.ts";

function UserFriendList(props: { user_id: number }) {
  const { user_id } = props;
  const { data: friends } = useFriendsGet({ user_id });

  const [modalOpen, setModalOpen] = useState(false);

  if (!friends) {
    return <Skeleton />;
  }

  return (
    <>
      <Button
        onClick={() => {
          setModalOpen(true);
        }}
        variant="outlined"
        startIcon={<People />}
      >
        {friends.filter((x) => x.status === "Accepted").length} teman
      </Button>
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>Daftar Teman</DialogTitle>
        <DialogContent>
          {friends.length !== 0 ? (
            <Stack gap={2}>
              {friends
                .filter((x) => x.status === "Accepted")
                .map((x) => (
                  <UserCard key={x.user_id} user_id={x.user_id} />
                ))}
            </Stack>
          ) : (
            <Typography variant="body1">
              Pengguna ini belum pernah menambahkan pengguna lain sebagai teman.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default UserFriendList;
