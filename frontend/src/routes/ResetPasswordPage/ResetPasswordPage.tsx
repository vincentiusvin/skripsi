import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { Redirect } from "wouter";
import OTP from "../../components/OTP.tsx";
import {
  useOTPDetailUserGet,
  useOTPToken,
  useUserValidation,
  useUsersDetailUpdatePassword,
} from "../../queries/user_hooks.ts";

function OTPStep(props: { email: string; next: (token: string) => void }) {
  const { email, next } = props;

  const { data: otpToken } = useOTPToken({
    email,
    type: "Password",
  });

  if (otpToken == undefined) {
    return <Skeleton />;
  }

  return (
    <Box>
      <OTP otp={otpToken} />
      <Button
        onClick={() => {
          next(otpToken.token);
        }}
        disabled={otpToken.verified_at == null}
      >
        Lanjut
      </Button>
    </Box>
  );
}

function ResetPasswordStepGetUser(props: { token: string }) {
  const { token } = props;
  const { data: user } = useOTPDetailUserGet({
    token,
  });

  if (user == undefined) {
    return <Skeleton />;
  }

  if (user.user_id == undefined) {
    return <Redirect to={"/"} />;
  }

  return <ResetPasswordStep token={token} user_id={user.user_id} />;
}

function ResetPasswordStep(props: { token: string; user_id: number }) {
  const { token, user_id } = props;
  const [userPassword, setUserPassword] = useState<string>("");
  const [userConfirmPassword, setUserConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate: editUser } = useUsersDetailUpdatePassword({
    user_id,
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Password baru berhasil disimpan!</Typography>,
        autoHideDuration: 5000,
        variant: "success",
      });
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
      token,
    });
  }

  return (
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
  );
}

function EnterEmailStep(props: { next: (email: string) => void }) {
  const { next } = props;
  const [email, setEmail] = useState<string | undefined>();

  const { isValid, data: valid } = useUserValidation({
    email: email ?? "",
    existing: true,
  });

  return (
    <Stack spacing={2}>
      <TextField
        label="Email"
        value={email ?? ""}
        onChange={(e) => {
          setEmail(e.target.value);
        }}
        error={email !== undefined && !isValid}
        helperText={email !== undefined ? valid?.email : undefined}
      />
      <Button
        variant="contained"
        disabled={!isValid}
        onClick={() => {
          if (email == undefined) {
            return;
          }
          next(email);
        }}
      >
        Lanjut
      </Button>
    </Stack>
  );
}

function ResetPassword() {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  return (
    <Stack spacing={2}>
      {step === 0 ? (
        <EnterEmailStep
          next={(e) => {
            setEmail(e);
            setStep(1);
          }}
        />
      ) : step === 1 ? (
        <OTPStep
          email={email}
          next={(t) => {
            setToken(t);
            setStep(2);
          }}
        />
      ) : step === 2 ? (
        <ResetPasswordStepGetUser token={token} />
      ) : undefined}
    </Stack>
  );
}

function ResetPasswordPage() {
  return <ResetPassword />;
}

export default ResetPasswordPage;
