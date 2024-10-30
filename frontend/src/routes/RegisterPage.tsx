import {
  Box,
  Button,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useLocation } from "wouter";
import { useUsersPost } from "../queries/user_hooks";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(0);

  const [, setLocation] = useLocation();

  const { mutate: postUsers } = useUsersPost({
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Berhasil mendaftarkan akun!</Typography>,
        autoHideDuration: 5000,
        variant: "success",
      });
      setLocation("/");
    },
  });

  function register() {
    postUsers({
      user_name: username,
      user_password: password,
    });
  }

  return (
    <Stack spacing={8} mt={2}>
      <Stepper activeStep={step}>
        <Step>
          <StepLabel>
            <Typography>Informasi akun</Typography>
          </StepLabel>
        </Step>
        <Step>
          <StepLabel>
            <Typography>Lengkapi data diri</Typography>
            <Typography variant="caption">Opsional</Typography>
          </StepLabel>
        </Step>
        <Step>
          <StepLabel>
            <Typography>Kode OTP</Typography>
          </StepLabel>
        </Step>
        <Step>
          <StepLabel>
            <Typography>Langkah berikutnya</Typography>
          </StepLabel>
        </Step>
      </Stepper>

      <Box
        sx={{
          paddingX: 52,
        }}
      >
        {step === 0 ? (
          <Paper
            sx={{
              paddingX: 4,
              paddingY: 8,
            }}
          >
            <Stack spacing={4}>
              <Typography variant="h5" fontWeight={"bold"} textAlign={"center"}>
                Daftar
              </Typography>
              <TextField
                fullWidth
                onChange={(e) => setUsername(e.target.value)}
                label="Username"
              ></TextField>
              <TextField
                fullWidth
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                label="Password"
              ></TextField>
            </Stack>
          </Paper>
        ) : (
          <Typography>halo</Typography>
        )}
        <Stack direction="row" spacing={2}>
          <Button fullWidth onClick={() => setStep((x) => x - 1)} variant="outlined">
            Mundur
          </Button>
          <Button fullWidth onClick={() => setStep((x) => x + 1)} variant="contained">
            Lanjut
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
}

function RegisterPage() {
  return <Register />;
}

export default RegisterPage;
