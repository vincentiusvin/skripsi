import { Email } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import OTP from "../../../components/OTP.tsx";
import {
  useOTPToken,
  useUsersDetailGet,
  useUsersDetailUpdateEmail,
} from "../../../queries/user_hooks.ts";

function OTPStep(props: { user_id: number; email: string; onFinished: () => void }) {
  const { email, user_id, onFinished } = props;

  const { data: otpToken } = useOTPToken({
    email,
    type: "Register",
  });

  const { mutate: _changeEmail } = useUsersDetailUpdateEmail({
    user_id,
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Email baru berhasil disimpan!</Typography>,
        autoHideDuration: 5000,
        variant: "success",
      });
      onFinished();
    },
  });

  function changeEmail() {
    if (otpToken == undefined || otpToken.verified_at == null) {
      return enqueueSnackbar({
        message: <Typography>Verifikasi OTP belu dilakukan!</Typography>,
        autoHideDuration: 5000,
        variant: "error",
      });
    }
    _changeEmail({
      token: otpToken.token,
      user_email: email,
    });
  }

  if (otpToken == undefined) {
    return <Skeleton />;
  }

  return (
    <Box>
      <OTP otp={otpToken} />
      <Button
        onClick={() => {
          changeEmail();
        }}
        disabled={otpToken.verified_at == null}
        variant="contained"
        fullWidth
      >
        Simpan
      </Button>
    </Box>
  );
}

function EmailStep(props: { user_id: number; next: (email: string) => void }) {
  const { user_id, next } = props;
  const { data } = useUsersDetailGet({
    user_id,
  });
  const [email, setEmail] = useState<string | undefined>();

  if (data == undefined) {
    return <Skeleton />;
  }

  let isErrored = false;
  let errorText: string | undefined = undefined;
  if (email == undefined) {
    isErrored = true;
    errorText = "Email baru belum dimasukkan!";
  } else if (email === data.user_email) {
    isErrored = true;
    errorText = "Email baru sama dengan email lama!";
  }

  return (
    <Stack spacing={2}>
      <TextField
        value={email ?? data.user_email}
        onChange={(e) => setEmail(e.target.value)}
        variant="standard"
        label="Email"
        fullWidth
        required
        error={isErrored}
        helperText={errorText}
      />
      <Button
        variant="contained"
        disabled={isErrored}
        onClick={() => {
          if (email == undefined || isErrored) {
            return enqueueSnackbar({
              message: <Typography>{errorText}</Typography>,
              autoHideDuration: 5000,
              variant: "error",
            });
          }
          next(email);
        }}
      >
        Lanjut
      </Button>
    </Stack>
  );
}

function UserChangeEmail(props: { user_id: number }) {
  const { user_id } = props;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState<string | undefined>();

  function reset() {
    setDialogOpen(false);
    setStep(0);
    setEmail(undefined);
  }

  return (
    <>
      <Dialog open={dialogOpen} onClose={() => reset()}>
        <DialogTitle> Ubah Email</DialogTitle>
        <DialogContent>
          {step === 1 && email !== undefined ? (
            <OTPStep email={email} user_id={user_id} onFinished={reset} />
          ) : (
            <EmailStep
              user_id={user_id}
              next={(email) => {
                setEmail(email);
                setStep(1);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      <Button
        onClick={() => {
          setDialogOpen(true);
        }}
        startIcon={<Email />}
      >
        Ganti Email
      </Button>
    </>
  );
}

export default UserChangeEmail;
