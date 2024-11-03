import { Key, Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useUsersDetailUpdate } from "../../../queries/user_hooks.ts";

function UserResetPassword(props: { user_id: number }) {
  const { user_id } = props;
  const [userPassword, setUserPassword] = useState<string | undefined>(undefined);
  const [userConfirmPassword, setUserConfirmPassword] = useState<string | undefined>(undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { mutate: editUser } = useUsersDetailUpdate({
    user_id,
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Password baru berhasil disimpan!</Typography>,
        autoHideDuration: 5000,
        variant: "success",
      });
      reset();
    },
  });

  function updatePassword() {
    if (userPassword !== userConfirmPassword) {
      enqueueSnackbar({
        message: <Typography>Password anda tidak sesuai!</Typography>,
        autoHideDuration: 5000,
        variant: "error",
      });
      return;
    }

    editUser({
      user_password: userPassword,
    });
  }

  function reset() {
    setUserConfirmPassword(undefined);
    setUserPassword(undefined);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setDialogOpen(false);
  }

  return (
    <>
      <Dialog open={dialogOpen} onClose={() => reset()}>
        <DialogTitle> Ubah Password</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              type={showPassword ? "text" : "password"}
              value={userPassword ?? ""}
              onChange={(e) => setUserPassword(e.target.value)}
              variant="standard"
              label="Password"
              fullWidth
              required
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="start">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword((show) => !show)}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              required
              label="Ketik Ulang Password"
              fullWidth
              value={userConfirmPassword ?? ""}
              onChange={(e) => setUserConfirmPassword(e.target.value)}
              type={showConfirmPassword ? "text" : "password"}
              variant="standard"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="start">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowConfirmPassword((show) => !show)}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button variant="contained" onClick={updatePassword}>
              Simpan
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
      <Button
        onClick={() => {
          setDialogOpen(true);
        }}
        variant="outlined"
        startIcon={<Key />}
      >
        Ganti Password
      </Button>
    </>
  );
}
export default UserResetPassword;
