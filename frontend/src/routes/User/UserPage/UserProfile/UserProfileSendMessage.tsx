import { Send } from "@mui/icons-material";
import { Button, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useLocation } from "wouter";
import { useChatroomsPost } from "../../../../queries/chat_hooks.ts";

function UserProfileSendMessage(props: { viewed_user_id: number; our_user_id: number }) {
  const { viewed_user_id, our_user_id } = props;
  const [, setLocation] = useLocation();
  const { mutate: sendMessage } = useChatroomsPost({
    onSuccess: ({ chatroom_id }) => {
      enqueueSnackbar({
        message: <Typography>Chatroom berhasil dibuat!</Typography>,
        variant: "success",
      });
      setLocation(`/chatroom-forwarder/${chatroom_id}`);
    },
  });

  return (
    <Button
      startIcon={<Send />}
      variant="contained"
      onClick={() => {
        sendMessage({
          chatroom_name: "Tidak berjudul",
          user_ids: [viewed_user_id, our_user_id],
        });
      }}
    >
      Kirim Pesan
    </Button>
  );
}
export default UserProfileSendMessage;
