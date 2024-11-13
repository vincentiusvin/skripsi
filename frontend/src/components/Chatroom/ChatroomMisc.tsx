import { Delete, Edit, Logout, People } from "@mui/icons-material";
import {
  Box,
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
  useProjectsDetailChatroomsPost,
  useUsersDetailChatroomsPost,
} from "../../queries/chat_hooks.ts";
import UserSelect from "../UserSelect.tsx";

export function AddMembersDialog(props: { chatroom_id: number }) {
  const { chatroom_id } = props;

  const { data: chatroom } = useChatroomsDetailGet({ chatroom_id });

  const { mutate: editRoom } = useChatroomsDetailPut({
    chatroom_id,
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>Ruangan berhasil diedit!</Typography>,
      });
      reset();
    },
  });
  const [editRoomMembersOpen, setEditRoomMembersOpen] = useState(false);
  const [newUsers, setNewUsers] = useState<number[] | undefined>();

  function reset() {
    setEditRoomMembersOpen(false);
    setNewUsers(undefined);
  }

  if (!chatroom) {
    return <Skeleton />;
  }

  const chatroom_users = chatroom.chatroom_users.map((x) => x.user_id);

  return (
    <>
      <MenuItem onClick={() => setEditRoomMembersOpen(true)}>
        <ListItemIcon>
          <People />
        </ListItemIcon>
        <ListItemText>Edit Anggota</ListItemText>
      </MenuItem>
      <Dialog open={editRoomMembersOpen} onClose={() => reset()}>
        <DialogTitle>Edit Anggota</DialogTitle>
        <DialogContent
          sx={{
            minWidth: 350,
          }}
        >
          <Box pt={2}>
            <UserSelect
              label={"Anggota"}
              current_users={newUsers ?? chatroom_users}
              onChange={(newUsers) => {
                setNewUsers(newUsers);
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              editRoom({
                user_ids: newUsers,
              });
            }}
          >
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
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
      reset();
    },
  });
  const [editRoomNameOpen, setEditRoomNameOpen] = useState(false);
  const [editRoomName, setEditRoomName] = useState<string | undefined>();
  if (!chatroom) {
    return <Skeleton />;
  }

  function reset() {
    setEditRoomName(undefined);
    setEditRoomNameOpen(false);
  }

  return (
    <>
      <MenuItem onClick={() => setEditRoomNameOpen(true)}>
        <ListItemIcon>
          <Edit />
        </ListItemIcon>
        <ListItemText>Edit Ruangan</ListItemText>
      </MenuItem>

      <Dialog open={editRoomNameOpen} onClose={() => reset()}>
        <DialogTitle>Edit ruangan</DialogTitle>
        <DialogContent>
          <Box pt={2}>
            <TextField
              required
              fullWidth
              value={editRoomName ?? chatroom.chatroom_name}
              onChange={(e) => setEditRoomName(e.target.value)}
              label="Nama Ruangan"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              editRoom({
                name: editRoomName,
              });
            }}
          >
            Simpan
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
      <ListItemText>Keluar</ListItemText>
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

function AddUserRoom(props: { user_id: number; name: string; onSuccess: () => void }) {
  const { user_id, onSuccess, name } = props;
  const { mutate: createUserRoom } = useUsersDetailChatroomsPost({
    user_id: user_id,
    onSuccess,
  });

  return (
    <Button
      onClick={() =>
        createUserRoom({
          name,
        })
      }
    >
      Buat ruangan
    </Button>
  );
}

function AddProjectRoom(props: { project_id: number; name: string; onSuccess: () => void }) {
  const { project_id, onSuccess, name } = props;
  const { mutate: createProjectRoom } = useProjectsDetailChatroomsPost({
    project_id,
    onSuccess,
  });

  return (
    <Button
      onClick={() =>
        createProjectRoom({
          name,
        })
      }
    >
      Buat ruangan
    </Button>
  );
}

export function AddRoomDialog(props: { user_id: number; project_id?: number }) {
  const { user_id, project_id } = props;

  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [addRoomName, setAddRoomName] = useState("");

  function reset() {
    setAddRoomName("");
    setAddRoomOpen(false);
  }

  function roomCreated() {
    enqueueSnackbar({
      message: <Typography>Ruang chat berhasil dibuat!</Typography>,
      variant: "success",
    });
    reset();
  }

  return (
    <>
      <Dialog open={addRoomOpen} onClose={() => reset()}>
        <DialogTitle>Tambah ruangan baru</DialogTitle>
        <DialogContent>
          <Box pt={2}>
            <TextField
              fullWidth
              onChange={(e) => setAddRoomName(e.target.value)}
              label="Nama Ruangan"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          {project_id !== undefined ? (
            <AddProjectRoom name={addRoomName} onSuccess={roomCreated} project_id={project_id} />
          ) : (
            <AddUserRoom name={addRoomName} onSuccess={roomCreated} user_id={user_id} />
          )}
        </DialogActions>
      </Dialog>
      <Button
        fullWidth
        variant="contained"
        onClick={() => {
          setAddRoomOpen(true);
        }}
      >
        Tambah Ruangan
      </Button>
    </>
  );
}
