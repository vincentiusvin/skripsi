import {
  Avatar,
  Box,
  Paper,
  Slide,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useState } from "react";
import charityImg from "../../assets/help.png";
import RegistrationBiodataStep from "./components/RegistrationBiodataStep.tsx";
import RegistrationConfirmStep from "./components/RegistrationConfirmStep.tsx";
import RegistrationCredentialStep from "./components/RegistrationCredentialStep.tsx";
import RegistrationFinishStep from "./components/RegistrationFinishStep.tsx";
import RegistrationOTPStep from "./components/RegistrationOTPStep.tsx";
import RegistrationSocialStep from "./components/RegistrationSocialStep.tsx";
import { RegistrationContext, UserData } from "./components/context.tsx";

function RegistrationSteps(props: { step: number }) {
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
            <Typography>Kredensial akun</Typography>
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
            <Typography>Langkah berikutnya</Typography>
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
          size={{ xs: 12, md: 7 }}
          order={{
            xs: 2,
            md: 1,
          }}
        >
          <Box width="fit-content" margin={"auto"}>
            <Paper
              sx={{
                paddingX: 4,
                paddingY: 4,
              }}
            >
              {actualStep === 0 ? (
                <RegistrationCredentialStep cont={() => setStep(1)} />
              ) : actualStep === 1 ? (
                <RegistrationBiodataStep cont={() => setStep(2)} back={() => setStep(0)} />
              ) : actualStep === 2 ? (
                <RegistrationSocialStep cont={() => setStep(3)} back={() => setStep(1)} />
              ) : actualStep === 3 ? (
                <RegistrationOTPStep cont={() => setStep(4)} back={() => setStep(2)} />
              ) : actualStep === 4 ? (
                <RegistrationConfirmStep back={() => setStep(3)} cont={() => setStep(6)} />
              ) : (
                <RegistrationFinishStep />
              )}
            </Paper>
          </Box>
        </Grid>
        <Grid
          size={{
            md: 5,
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
              <RegistrationSteps step={actualStep} />
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
