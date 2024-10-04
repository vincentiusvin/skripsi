import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import UserCard from "./Cards/UserCard.tsx";

function UserSelectDialog(
  props: {
    current_users: number[];
    allowed_users: number[];
    onSave?: (x: number[]) => void;
  } & DialogProps,
) {
  const { current_users, allowed_users, onSave, ...rest } = props;

  const [newUsers, setNewUsers] = useState<number[]>(current_users);

  const userTypes = [
    {
      name: "Pengguna Aktif",
      users: current_users.filter((x) => newUsers.includes(x)),
      isDeletable: true,
      isAddable: false,
    },
    {
      name: "Pengguna Pending",
      users: newUsers.filter((x) => !current_users.includes(x)),
      isDeletable: true,
      isAddable: false,
    },
    {
      name: "Pengguna yang Dapat Ditambahkan",
      users: allowed_users.filter((x) => !newUsers.includes(x)),
      isDeletable: false,
      isAddable: true,
    },
  ] as const;

  return (
    <Dialog {...rest}>
      <DialogTitle>Tambah pengguna</DialogTitle>
      <DialogContent
        sx={{
          minWidth: 350,
        }}
      >
        <Stack direction={"column"} spacing={4}>
          {userTypes.map((user_type, i) => (
            <Stack key={i} direction={"column"}>
              <Typography variant="h6" fontWeight={"bold"}>
                {user_type.name}
              </Typography>
              {user_type.users.map((user_id) => (
                <UserCard
                  key={user_id}
                  user_id={user_id}
                  sidebar={[
                    user_type.isAddable ? (
                      <Button
                        key={0}
                        onClick={() => {
                          setNewUsers((x) => [...x.filter((y) => y != user_id), user_id]);
                        }}
                      >
                        Tambah
                      </Button>
                    ) : null,
                    user_type.isDeletable ? (
                      <Button
                        key={1}
                        onClick={() => {
                          setNewUsers((x) => [...x.filter((y) => y != user_id)]);
                        }}
                      >
                        Hapus
                      </Button>
                    ) : null,
                  ]}
                />
              ))}
            </Stack>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            if (onSave) {
              onSave(newUsers);
            }
          }}
        >
          Simpan
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UserSelectDialog;
