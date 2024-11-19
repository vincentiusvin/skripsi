import { Box, Button, Skeleton, Stack } from "@mui/material";
import OTP from "../../../components/OTP.tsx";
import { useOTPToken } from "../../../queries/user_hooks.ts";
import { useRegistrationContext } from "./context.tsx";

function RegistrationOTPStep(props: { cont: () => void; back: () => void }) {
  const { back, cont } = props;
  const [reg, setReg] = useRegistrationContext();

  const { data: otpToken } = useOTPToken({
    email: reg.email ?? "",
    type: "Register",
  });

  if (otpToken == undefined) {
    return <Skeleton />;
  }

  return (
    <Box>
      <OTP
        otp={otpToken}
        onVerified={() => {
          setReg((x) => ({
            ...x,
            registration_token: otpToken.token,
          }));
        }}
      />
      <Stack direction="row" spacing={2} mt={4}>
        <Button fullWidth onClick={() => back()} variant="outlined">
          Mundur
        </Button>
        <Button
          disabled={reg.registration_token == undefined}
          fullWidth
          onClick={() => cont()}
          variant="contained"
        >
          Lanjut
        </Button>
      </Stack>
    </Box>
  );
}
export default RegistrationOTPStep;
