import { Delete, Edit, Logout, People } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import {
  useChatroomsDetailDelete,
  useChatroomsDetailGet,
  useChatroomsDetailPut,
} from "../../queries/chat_hooks.ts";
import { useUsersGet } from "../../queries/user_hooks.ts";
import UserSelectDialog from "../UserSelect.tsx";

export function AddMembersDialog(props: { chatroom_id: number }) {
  const { chatroom_id } = props;
  const { data: users } = useUsersGet();

  const { data: chatroom } = useChatroomsDetailGet({ chatroom_id });

  const { mutate: editRoom } = useChatroomsDetailPut({
    chatroom_id,
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>Ruangan berhasil diedit!</Typography>,
      });
    },
  });
  const [editRoomMembersOpen, setEditRoomMembersOpen] = useState(false);

  if (!chatroom || !users) {
    return <Skeleton />;
  }

  const chatroom_users = chatroom.chatroom_users.map((x) => x.user_id);
  const all_users = users.map((x) => x.user_id);

  return (
    <>
      <MenuItem onClick={() => setEditRoomMembersOpen(true)}>
        <ListItemIcon>
          <People />
        </ListItemIcon>
        <ListItemText>Add Members</ListItemText>
      </MenuItem>
      <UserSelectDialog
        current_users={chatroom_users}
        allowed_users={all_users}
        open={editRoomMembersOpen}
        onClose={() => setEditRoomMembersOpen(false)}
        onSave={(new_users) => {
          editRoom({
            user_ids: new_users,
          });
          setEditRoomMembersOpen(false);
        }}
      />
    </>
  );
}

export function ChangeNameDialog(props: { chatroom_id: number }) {
  const { chatroom_id } = props;

  const { data: chatroom } = useChatroomsDetailGet({ chatroom_id });
  const { mutate: editRoom } = useChatroomsDetailPut({
    chatroom_id,
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>Ruangan berhasil diedit!</Typography>,
      });
    },
  });
  const [editRoomNameOpen, setEditRoomNameOpen] = useState(false);
  const [editRoomName, setEditRoomName] = useState<string | undefined>();
  if (!chatroom) {
    return <Skeleton />;
  }

  return (
    <>
      <MenuItem onClick={() => setEditRoomNameOpen(true)}>
        <ListItemIcon>
          <Edit />
        </ListItemIcon>
        <ListItemText> Rename </ListItemText>
      </MenuItem>

      <Dialog open={editRoomNameOpen} onClose={() => setEditRoomNameOpen(false)}>
        <DialogTitle>Rename room</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={editRoomName ?? chatroom.chatroom_name}
            onChange={(e) => setEditRoomName(e.target.value)}
            label="Room name"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              editRoom({
                name: editRoomName,
              });
              setEditRoomNameOpen(false);
            }}
          >
            Rename Room
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function LeaveRoom(props: { chatroom_id: number; user_id: number; onLeave?: () => void }) {
  const { chatroom_id, user_id, onLeave } = props;

  const { data: chatroom } = useChatroomsDetailGet({ chatroom_id });
  const { mutate: editRoom } = useChatroomsDetailPut({
    chatroom_id,
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>Ruangan ditinggalkan!</Typography>,
      });
    },
  });

  if (!chatroom) {
    return <Skeleton />;
  }
  return (
    <MenuItem
      onClick={() => {
        editRoom({
          user_ids: chatroom.chatroom_users.map((x) => x.user_id).filter((x) => x !== user_id),
        });
        if (onLeave) {
          onLeave();
        }
      }}
    >
      <ListItemIcon>
        <Logout />
      </ListItemIcon>
      <ListItemText>Leave</ListItemText>
    </MenuItem>
  );
}

export function DeleteRoom(props: { chatroom_id: number; onLeave?: () => void }) {
  const { chatroom_id, onLeave } = props;

  const { data: chatroom } = useChatroomsDetailGet({ chatroom_id });
  const { mutate: deleteRoom } = useChatroomsDetailDelete({
    chatroom_id,
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>Ruangan dihapus!</Typography>,
      });
    },
  });

  if (!chatroom) {
    return <Skeleton />;
  }
  return (
    <MenuItem
      onClick={() => {
        deleteRoom();
        if (onLeave) {
          onLeave();
        }
      }}
    >
      <ListItemIcon>
        <Delete />
      </ListItemIcon>
      <ListItemText>Hapus</ListItemText>
    </MenuItem>
  );
}
