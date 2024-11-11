import { Box, Button, Stack, Typography } from "@mui/material";
import { useRegistrationContext } from "./context.tsx";

function RegistrationOTPStep(props: { cont: () => void; back: () => void }) {
  const { back, cont } = props;
  const [reg] = useRegistrationContext();
  return (
    <Stack spacing={4}>
      <Typography variant="h5" fontWeight={"bold"} textAlign={"center"}>
        Kode OTP
      </Typography>
      <Box>
        <Typography>
          Kami telah mengirim kode OTP ke alamat email anda di <b>{reg.email}</b>.
        </Typography>
        <Typography>Silahkan masukkan kode tersebut ke sini:</Typography>
      </Box>
      <Box></Box>
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
export default RegistrationOTPStep;
