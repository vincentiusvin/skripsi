import { Button, Stack, Typography } from "@mui/material";

function RegistrationOTPStep(props: { cont: () => void; back: () => void }) {
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
export default RegistrationOTPStep;
