import { Add, Email, Remove } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  InputAdornment,
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
import { Dispatch, SetStateAction, createContext, useContext, useState } from "react";
import charityImg from "../assets/help.png";
import DisplayOnlyTextfield from "../components/DisplayOnlyTextfield.tsx";
import StyledLink from "../components/StyledLink.tsx";
import { LinkIcons, linkParser } from "../helpers/linker.tsx";
import { useList } from "../helpers/misc.ts";
import { useUsersPost } from "../queries/user_hooks";

type UserData = {
  email: string;
  username: string;
  password: string;
  education?: string;
  school?: string;
  website?: string;
  location?: string;
  social_medias: string[];
};

type UserDataState = [UserData, Dispatch<SetStateAction<UserData>>];

const RegistrationContext = createContext<UserDataState>([
  {
    username: "",
    password: "",
    email: "",
    social_medias: [""],
  },
  () => {},
]);

function useRegistrationContext() {
  return useContext(RegistrationContext);
}

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
            <Typography>Tambahkan media sosial</Typography>
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

function Socials(props: { cont: () => void; back: () => void }) {
  const { back, cont } = props;
  const [reg, setRegistration] = useRegistrationContext();
  const [socials, { removeAt, push, updateAt }] = useList<string>(reg.social_medias);

  function updateReg() {
    setRegistration((x) => ({
      ...x,
      social_medias: socials,
    }));
  }

  return (
    <Stack spacing={2}>
      <Stack direction={"row"} alignItems={"center"}>
        <Typography variant="h6" fontWeight={"bold"} flexGrow={1}>
          Akun media sosial
        </Typography>
        <IconButton onClick={() => push("")}>
          <Add />
        </IconButton>
      </Stack>
      {socials.map((x, i) => {
        const try_parse = linkParser(x);
        return (
          <Stack key={i} direction="row" alignItems={"center"}>
            <TextField
              label={try_parse !== "Other" ? try_parse : "Link"}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">{LinkIcons[try_parse]}</InputAdornment>
                  ),
                },
              }}
              value={x}
              onChange={(e) => {
                updateAt(i, e.target.value);
              }}
            />
            <IconButton
              onClick={() => {
                removeAt(i);
              }}
            >
              <Remove />
            </IconButton>
          </Stack>
        );
      })}
      <Stack direction="row" spacing={2}>
        <Button
          fullWidth
          onClick={() => {
            updateReg();
            back();
          }}
          variant="outlined"
        >
          Mundur
        </Button>
        <Button
          fullWidth
          onClick={() => {
            updateReg();
            cont();
          }}
          variant="contained"
        >
          Lanjut
        </Button>
      </Stack>
    </Stack>
  );
}

function AdditionalInfo(props: { cont: () => void; back: () => void }) {
  const { back, cont } = props;
  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={"bold"} textAlign={"center"}>
        Lengkapi Data Diri
      </Typography>
      <TextField label="Tingkat Pendidikan" fullWidth />
      <TextField label="Sekolah/Universitas" fullWidth />
      <TextField label="Website" fullWidth />
      <TextField label="Lokasi" fullWidth />
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

function OneTimePass(props: { cont: () => void; back: () => void }) {
  const { back, cont } = props;
  return (
    <Stack direction="row" spacing={2}>
      <Typography>Kode OTP</Typography>
      <Button fullWidth onClick={() => back()} variant="outlined">
        Mundur
      </Button>
      <Button fullWidth onClick={() => cont()} variant="contained">
        Lanjut
      </Button>
    </Stack>
  );
}

function Credentials(props: { cont: () => void }) {
  const [reg, setReg] = useRegistrationContext();
  const { cont } = props;
  return (
    <Stack spacing={4}>
      <Typography variant="h5" fontWeight={"bold"} textAlign={"center"}>
        Daftar
      </Typography>
      <TextField
        value={reg.email}
        onChange={(e) => {
          setReg((x) => ({
            ...x,
            email: e.target.value,
          }));
        }}
        required
        label="Email"
        fullWidth
      />
      <TextField
        required
        fullWidth
        value={reg.username}
        onChange={(e) =>
          setReg((x) => ({
            ...x,
            username: e.target.value,
          }))
        }
        label="Username"
      ></TextField>
      <TextField
        required
        fullWidth
        type="password"
        value={reg.password}
        onChange={(e) =>
          setReg((x) => ({
            ...x,
            password: e.target.value,
          }))
        }
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

function Confirm(props: { back: () => void; cont: () => void }) {
  const [reg] = useRegistrationContext();
  const { back, cont } = props;
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
      user_name: reg.username,
      user_password: reg.password,
    });
  }

  return (
    <Stack spacing={2}>
      <DisplayOnlyTextfield icon={<Email />} label="Email" value={reg.email} />

      <Stack direction="row" spacing={2}>
        <Button fullWidth onClick={() => back()} variant="outlined">
          Mundur
        </Button>
        <Button fullWidth onClick={register} variant="contained">
          Daftar
        </Button>
      </Stack>
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
  const userState = useState<UserData>({
    email: "",
    password: "",
    social_medias: ["", ""],
    username: "",
  });

  // kalau baru mulai undefined, tapi dianggap 0
  // dipakai untuk matiin transisi pas pertama render
  const [step, setStep] = useState<number | undefined>(undefined);
  const actualStep = step == undefined ? 0 : step;
  const isStepped = step !== undefined;

  return (
    <RegistrationContext.Provider value={userState}>
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
              <Credentials cont={() => setStep(1)} />
            ) : actualStep === 1 ? (
              <AdditionalInfo cont={() => setStep(2)} back={() => setStep(0)} />
            ) : actualStep === 2 ? (
              <Socials cont={() => setStep(3)} back={() => setStep(1)} />
            ) : actualStep === 3 ? (
              <OneTimePass cont={() => setStep(4)} back={() => setStep(2)} />
            ) : actualStep === 4 ? (
              <Confirm back={() => setStep(3)} cont={() => setStep(6)} />
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
    </RegistrationContext.Provider>
  );
}

function RegisterPage() {
  return <Register />;
}

export default RegisterPage;
