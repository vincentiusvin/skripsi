import { People } from "@mui/icons-material";
import { Button, Dialog, DialogContent, DialogTitle, Paper, Skeleton, Stack } from "@mui/material";
import { useState } from "react";
import UserCard from "../../../../components/UserCard.tsx";
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
          <Stack gap={2}>
            {friends
              .filter((x) => x.status === "Accepted")
              .map((x) => (
                <Paper
                  key={x.user_id}
                  sx={{
                    p: 2,
                  }}
                >
                  <UserCard user_id={x.user_id} />
                </Paper>
              ))}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default UserFriendList;
