import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { Redirect, useLocation } from "wouter";
import OTP from "../../components/OTP.tsx";
import StyledLink from "../../components/StyledLink.tsx";
import UserLabel from "../../components/UserLabel.tsx";
import { useSessionGet } from "../../queries/sesssion_hooks.ts";
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
    <Stack maxWidth={500} margin="auto" spacing={2} padding={4} marginTop={4} component={Paper}>
      <OTP otp={otpToken} />
      <Stack direction="row" gap={2}>
        <StyledLink to={"/login"} flexGrow={1}>
          <Button color="error" variant="outlined" fullWidth>
            Batalkan
          </Button>
        </StyledLink>
        <Button
          sx={{
            flexGrow: 1,
          }}
          variant="contained"
          onClick={() => {
            next(otpToken.token);
          }}
          disabled={otpToken.verified_at == null}
        >
          Lanjut
        </Button>
      </Stack>
    </Stack>
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
  const [, setLocation] = useLocation();

  const { mutate: editUser } = useUsersDetailUpdatePassword({
    user_id,
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Password baru berhasil disimpan!</Typography>,
        autoHideDuration: 5000,
        variant: "success",
      });
      setLocation("/login");
    },
  });

  function updatePassword() {
    if (userPassword !== userConfirmPassword) {
      enqueueSnackbar({
        message: <Typography>Password anda tidak sesuai!</Typography>,
        autoHideDuration: 5000,
        variant: "error",
      });
    }

    editUser({
      user_password: userPassword,
      token,
    });
  }

  return (
    <Stack maxWidth={450} margin="auto" marginTop={4} spacing={4}>
      <Paper
        sx={{
          paddingY: 2,
          paddingX: { sm: 8, xs: 2 },
        }}
      >
        <Typography variant="h6" fontWeight={"bold"} textAlign={"center"} pb={2}>
          Akun Anda
        </Typography>
        <Paper
          sx={{
            paddingY: 2,
            paddingX: 4,
          }}
        >
          <StyledLink to={`/users/${user_id}`}>
            <UserLabel user_id={user_id} />
          </StyledLink>
        </Paper>
      </Paper>
      <Stack spacing={2} component={Paper} paddingX={{ md: 8, xs: 2 }} paddingY={4}>
        <Typography variant="h6" fontWeight={"bold"} textAlign={"center"} pb={2}>
          Masukkan Password Baru
        </Typography>
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

        <Stack direction="row" gap={2}>
          <StyledLink to={"/login"} flexGrow={1}>
            <Button color="error" variant="outlined" fullWidth>
              Batalkan
            </Button>
          </StyledLink>
          <Button
            sx={{
              flexGrow: 1,
            }}
            variant="contained"
            onClick={updatePassword}
          >
            Simpan
          </Button>
        </Stack>
      </Stack>
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
    <Stack
      spacing={2}
      maxWidth={450}
      margin="auto"
      marginTop={8}
      paddingX={{ md: 8, xs: 2 }}
      paddingY={4}
      component={Paper}
    >
      <Typography variant="h6" fontWeight={"bold"} textAlign={"center"} pb={2}>
        Email
      </Typography>
      <Typography>Silahkan masukkan alamat email anda di bawah:</Typography>
      <TextField
        label="Email"
        value={email ?? ""}
        onChange={(e) => {
          setEmail(e.target.value);
        }}
        error={email !== undefined && !isValid}
        helperText={email !== undefined ? valid?.email : undefined}
      />
      <Stack direction="row" gap={2}>
        <StyledLink to={"/login"} flexGrow={1}>
          <Button color="error" variant="outlined" fullWidth>
            Batalkan
          </Button>
        </StyledLink>
        <Button
          sx={{
            flexGrow: 1,
          }}
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
    </Stack>
  );
}

function ResetPassword() {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  return (
    <Stack spacing={2}>
      <Typography
        variant="h4"
        fontWeight={"bold"}
        align="center"
        sx={{
          wordBreak: "break-word",
        }}
      >
        Ubah Password
      </Typography>
      <Box>
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
      </Box>
    </Stack>
  );
}

function ResetPasswordPage() {
  const { data: session } = useSessionGet();
  if (session == undefined) {
    return <Skeleton />;
  }
  if (session.logged) {
    return <Redirect to={"/"} />;
  }
  return <ResetPassword />;
}

export default ResetPasswordPage;
