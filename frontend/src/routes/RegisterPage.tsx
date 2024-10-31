import {
  Avatar,
  Box,
  Button,
  Paper,
  Slide,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import charityImg from "../assets/help.png";
import StyledLink from "../components/StyledLink.tsx";
import { useUsersPost } from "../queries/user_hooks";

function RegisterSteps(props: { step: number }) {
  const { step } = props;
  const responsive = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));

  return (
    <Slide in={true} direction="up">
      <Stepper
        activeStep={step}
        orientation={responsive ? "horizontal" : "vertical"}
        alternativeLabel={responsive}
        sx={{
          width: "100%",
          overflow: "auto",
        }}
      >
        <Step>
          <StepLabel>
            <Typography>Kredensial Akun</Typography>
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
            <Typography>Konfirmasi</Typography>
          </StepLabel>
        </Step>
        <Step>
          <StepLabel>
            <Typography>Langkah Berikutnya</Typography>
          </StepLabel>
        </Step>
      </Stepper>
    </Slide>
  );
}

function ImageSidebar(props: { isStepped: boolean }) {
  const { isStepped } = props;
  return (
    <Slide in={true} direction="down" appear={isStepped}>
      <Box>
        <Typography variant="h4" fontWeight={"bold"} textAlign={"center"}>
          Dev4You
        </Typography>
        <Avatar
          sx={{
            display: {
              xs: "none",
              md: "block",
            },
            margin: "auto",
            width: "75%",
            height: "100%",
          }}
          variant="square"
          src={charityImg}
        ></Avatar>
      </Box>
    </Slide>
  );
}

function SecondStep(props: { cont: () => void; back: () => void }) {
  const { back, cont } = props;
  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={"bold"} textAlign={"center"}>
        Lengkapi Data Diri
      </Typography>
      <Stack direction="row" spacing={2}>
        <Button fullWidth onClick={() => back()} variant="outlined">
          Mundur
        </Button>
        <Button fullWidth onClick={() => cont()} variant="contained">
          Lanjut
        </Button>
      </Stack>
    </Stack>
  );
}

function ThirdStep(props: { cont: () => void; back: () => void }) {
  const { back, cont } = props;
  return (
    <Stack direction="row" spacing={2}>
      <Button fullWidth onClick={() => back()} variant="outlined">
        Mundur
      </Button>
      <Button fullWidth onClick={() => cont()} variant="contained">
        Lanjut
      </Button>
    </Stack>
  );
}

function FirstStep(props: {
  setUsername: (x: string) => void;
  setPassword: (x: string) => void;
  password: string;
  username: string;
  cont: () => void;
}) {
  const { username, password, setUsername, setPassword, cont } = props;
  return (
    <Stack spacing={4}>
      <Typography variant="h5" fontWeight={"bold"} textAlign={"center"}>
        Daftar
      </Typography>
      <TextField
        fullWidth
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        label="Username"
      ></TextField>
      <TextField
        fullWidth
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        label="Password"
        sx={{ display: "block" }}
      ></TextField>
      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={() => {
          cont();
        }}
      >
        Lanjut
      </Button>
      <Stack spacing={1} alignItems={"center"}>
        <Stack direction="row" spacing={2} alignItems={"center"} justifyContent={"center"}>
          <Typography>Sudah memiliki akun?</Typography>
          <StyledLink to="/login">
            <Button>Masuk</Button>
          </StyledLink>
        </Stack>
      </Stack>
    </Stack>
  );
}

function Confirm(props: {
  username: string;
  password: string;
  back: () => void;
  cont: () => void;
}) {
  const { username, password, back, cont } = props;
  const { mutate: postUsers } = useUsersPost({
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Berhasil mendaftarkan akun!</Typography>,
        autoHideDuration: 5000,
        variant: "success",
      });
      cont();
    },
  });

  function register() {
    postUsers({
      user_name: username,
      user_password: password,
    });
  }

  return (
    <Stack direction="row" spacing={2}>
      <Button fullWidth onClick={() => back()} variant="outlined">
        Mundur
      </Button>
      <Button fullWidth onClick={register} variant="contained">
        Daftar
      </Button>
    </Stack>
  );
}

function Next() {
  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" textAlign="center" mb={2}>
        Selamat, akun anda telah terbuat!
      </Typography>
      <Stack direction="row" spacing={2}>
        <Typography variant="body1" flexGrow={1}>
          Apabila anda ingin mendaftarkan organisasi nirlaba anda di sini, baca lebih lanjut di
          sini.
        </Typography>
        <Typography flexGrow={1}>
          Apabila anda ingin mulai berkontribusi dalam proyek nirlaba yang sudah ada, baca lebih
          lanjut di sini.
        </Typography>
      </Stack>
    </Box>
  );
}

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // kalau baru mulai undefined, tapi dianggap 0
  // dipakai untuk matiin transisi pas pertama render
  const [step, setStep] = useState<number | undefined>(undefined);
  const actualStep = step == undefined ? 0 : step;
  const isStepped = step !== undefined;

  return (
    <Grid
      container
      minHeight={"inherit"}
      alignItems={"center"}
      paddingX={{ xs: 2, md: 8 }}
      columnSpacing={{ xs: 8, lg: 16 }}
      rowSpacing={2}
    >
      <Grid
        size={{ xs: 12, md: 5 }}
        order={{
          xs: 2,
          md: 1,
        }}
      >
        <Paper
          sx={{
            paddingX: 4,
            paddingY: 8,
          }}
        >
          {actualStep === 0 ? (
            <FirstStep
              cont={() => setStep(1)}
              password={password}
              username={username}
              setUsername={setUsername}
              setPassword={setPassword}
            />
          ) : actualStep === 1 ? (
            <SecondStep cont={() => setStep(2)} back={() => setStep(0)} />
          ) : actualStep === 2 ? (
            <ThirdStep cont={() => setStep(3)} back={() => setStep(1)} />
          ) : actualStep === 3 ? (
            <Confirm
              username={username}
              password={password}
              back={() => setStep(2)}
              cont={() => setStep(5)}
            />
          ) : (
            <Next />
          )}
        </Paper>
      </Grid>
      <Grid
        size={{
          md: 7,
          xs: 12,
        }}
        order={{
          xs: 1,
          md: 2,
        }}
      >
        <Stack alignItems={"center"} justifyContent={"center"}>
          {actualStep === 0 ? (
            <ImageSidebar isStepped={isStepped} />
          ) : (
            <RegisterSteps step={actualStep} />
          )}
        </Stack>
      </Grid>
    </Grid>
  );
}

function RegisterPage() {
  return <Register />;
}

export default RegisterPage;
