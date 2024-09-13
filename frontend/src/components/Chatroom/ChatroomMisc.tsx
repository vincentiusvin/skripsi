import { Add, Edit, Logout, People, Remove } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import React, { useState } from "react";
import { useChatroomsDetailGet, useChatroomsDetailPut } from "../../queries/chat_hooks.ts";
import { useUsersGet } from "../../queries/user_hooks.ts";

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
  const [editRoomMembers, setEditRoomMembers] = useState<number[] | undefined>();

  const inUsers: typeof users & [] = [];
  const pendingUsers: typeof users & [] = [];
  const outUsers: typeof users & [] = [];

  if (!chatroom || !users) {
    return <Skeleton />;
  }

  const chatroom_users = chatroom.chatroom_users.map((x) => x.user_id);

  users.forEach((x) => {
    if (chatroom_users.includes(x.user_id)) {
      inUsers.push(x);
    } else if (editRoomMembers?.includes(x.user_id)) {
      pendingUsers.push(x);
    } else {
      outUsers.push(x);
    }
  });

  return (
    <>
      <MenuItem onClick={() => setEditRoomMembersOpen(true)}>
        <ListItemIcon>
          <People />
        </ListItemIcon>
        <ListItemText>Add Members</ListItemText>
      </MenuItem>
      <Dialog open={editRoomMembersOpen} onClose={() => setEditRoomMembersOpen(false)}>
        <DialogTitle>Add members</DialogTitle>
        <DialogContent
          sx={{
            minWidth: 350,
          }}
        >
          <Typography fontWeight={"bold"} variant="h6">
            Chat members:
          </Typography>
          {inUsers.map((x, i) => (
            <Typography key={i}>{x.user_name}</Typography>
          ))}
          <Divider
            sx={{
              my: 2,
            }}
          />
          <Typography fontWeight={"bold"} variant="h6">
            Could be invited:
          </Typography>
          <Grid container>
            {outUsers.map((x, i) => (
              <React.Fragment key={i}>
                <Grid size={10}>
                  <Typography>{x.user_name}</Typography>
                </Grid>
                <Grid size={2}>
                  <Button onClick={() => setEditRoomMembers((old) => [...(old ?? []), x.user_id])}>
                    <Add />
                  </Button>
                </Grid>
              </React.Fragment>
            ))}
          </Grid>

          {!!pendingUsers.length && (
            <>
              <Divider
                sx={{
                  my: 2,
                }}
              />
              <Typography fontWeight={"bold"} variant="h6">
                Pending invite:
              </Typography>
              <Grid container>
                {pendingUsers.map((x, i) => (
                  <React.Fragment key={i}>
                    <Grid key={i} size={10}>
                      <Typography>{x.user_name}</Typography>
                    </Grid>
                    <Grid size={2}>
                      <Button
                        onClick={() =>
                          setEditRoomMembers((old) =>
                            old?.filter((old_num) => old_num !== x.user_id),
                          )
                        }
                      >
                        <Remove />
                      </Button>
                    </Grid>
                  </React.Fragment>
                ))}
              </Grid>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              editRoom({
                user_ids: editRoomMembers,
              });
              setEditRoomMembersOpen(false);
            }}
          >
            Save members
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
            value={editRoomName}
            onChange={(e) => setEditRoomName(e.target.value)}
            label="Room name"
            defaultValue={chatroom.chatroom_name}
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
