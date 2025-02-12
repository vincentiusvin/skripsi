import { AddCircle, Delete, Edit, Logout, People, SearchOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import {
  useChatroomsDetailDelete,
  useChatroomsDetailGet,
  useChatroomsDetailPut,
  useChatroomsDetailUserDetailDelete,
  useChatroomsDetailUserDetailPut,
  useChatroomsPost,
} from "../../queries/chat_hooks.ts";
import { useUsersGet } from "../../queries/user_hooks.ts";
import BasicPagination from "../Pagination.tsx";
import UserLabel from "../UserLabel.tsx";

function ActiveMember(props: { chatroom_id: number; user_id: number }) {
  const { chatroom_id, user_id } = props;
  const { mutate: deleteMember } = useChatroomsDetailUserDetailDelete({
    chatroom_id,
    user_id,
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>Berhasil menghapus anggota!</Typography>,
      });
    },
  });

  return (
    <Stack direction={"row"}>
      <UserLabel size="small" user_id={user_id} />
      <Box flexGrow={1} />
      <Button onClick={() => deleteMember()}>Hapus</Button>
    </Stack>
  );
}

function AddMember(props: { chatroom_id: number; user_id: number; disabled: boolean }) {
  const { chatroom_id, user_id, disabled } = props;
  const { mutate: addMember } = useChatroomsDetailUserDetailPut({
    chatroom_id,
    user_id,
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>Berhasil menambah anggota!</Typography>,
      });
    },
  });

  return (
    <Stack direction={"row"}>
      <UserLabel size="small" user_id={user_id} />
      <Box flexGrow={1} />
      <Button disabled={disabled} onClick={() => addMember()}>
        Tambah
      </Button>
    </Stack>
  );
}

export function AddMembersDialog(props: { chatroom_id: number }) {
  const { chatroom_id } = props;

  const [addRoomMembersOpen, setAddRoomMembersOpen] = useState(false);

  const [keyword, setKeyword] = useState<string>("");
  const [debouncedKeyword] = useDebounce(keyword, 300);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: user_data } = useUsersGet({
    page,
    limit,
    keyword: debouncedKeyword,
  });
  const users = user_data?.result;
  const { data: chatroom } = useChatroomsDetailGet({ chatroom_id });

  function reset() {
    setAddRoomMembersOpen(false);
    setKeyword("");
  }

  if (!chatroom) {
    return <Skeleton />;
  }

  const chatroom_users = chatroom.chatroom_users.map((x) => x.user_id);

  return (
    <>
      <MenuItem onClick={() => setAddRoomMembersOpen(true)}>
        <ListItemIcon>
          <AddCircle />
        </ListItemIcon>
        <ListItemText>Tambah Anggota</ListItemText>
      </MenuItem>
      <Dialog open={addRoomMembersOpen} onClose={() => reset()}>
        <DialogTitle>Tambah Anggota</DialogTitle>
        <DialogContent
          sx={{
            minWidth: 350,
          }}
        >
          <Stack mt={2} gap={2}>
            <TextField
              label="Cari pengguna"
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
              value={keyword}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Stack rowGap={1}>
              {users?.map((x) => (
                <AddMember
                  key={x.user_id}
                  chatroom_id={chatroom_id}
                  user_id={x.user_id}
                  disabled={chatroom_users.includes(x.user_id)}
                />
              ))}
            </Stack>
            <BasicPagination limit={limit} page={page} setPage={setPage} total={user_data?.total} />
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function EditMembersDialog(props: { chatroom_id: number }) {
  const { chatroom_id } = props;

  const { data: chatroom } = useChatroomsDetailGet({ chatroom_id });

  const [editRoomMembersOpen, setEditRoomMembersOpen] = useState(false);

  function reset() {
    setEditRoomMembersOpen(false);
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
          <Stack rowGap={1}>
            {chatroom_users?.map((user_id) => (
              <ActiveMember key={user_id} chatroom_id={chatroom_id} user_id={user_id} />
            ))}
          </Stack>
        </DialogContent>
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
  const { mutate: deleteMember } = useChatroomsDetailUserDetailDelete({
    chatroom_id,
    user_id,
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
        deleteMember();
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

export function AddRoomDialog(props: { user_id: number; project_id?: number }) {
  const { user_id, project_id } = props;

  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [addRoomName, setAddRoomName] = useState("");

  const { mutate: _addRoom } = useChatroomsPost({
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Ruang chat berhasil dibuat!</Typography>,
        variant: "success",
      });
      reset();
    },
  });

  function addRoom() {
    _addRoom({
      chatroom_name: addRoomName,
      project_id,
      user_ids: project_id === undefined ? [user_id] : undefined,
    });
  }

  function reset() {
    setAddRoomName("");
    setAddRoomOpen(false);
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
          <Button onClick={() => addRoom()}>Buat ruangan</Button>
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
