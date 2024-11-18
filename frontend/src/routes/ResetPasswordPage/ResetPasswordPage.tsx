import { Box, Button, Skeleton, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import OTP from "../../components/OTP.tsx";
import { useOTPToken, useUserValidation } from "../../queries/user_hooks.ts";

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

function EnterEmailStep(props: { next: (email: string) => void }) {
  const { next } = props;
  const [email, setEmail] = useState("");

  const [debouncedEmail] = useDebounce(email, 300);

  const { data: valid, isLoading } = useUserValidation({
    email: debouncedEmail,
  });

  const isValidated = valid != undefined && !isLoading && debouncedEmail === email && email !== "";
  const isAllowed = isValidated && valid.email === undefined;

  return (
    <Stack spacing={2}>
      <TextField
        label="Email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
        }}
        error={valid?.email != undefined}
        helperText={valid?.email}
      />
      <Button
        variant="contained"
        disabled={!isAllowed}
        onClick={() => {
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
  const [, setToken] = useState("");

  return (
    <Stack spacing={2}>
      {step === 0 ? (
        <EnterEmailStep
          next={(e) => {
            setEmail(e);
            setStep(1);
          }}
        />
      ) : (
        <OTPStep
          email={email}
          next={(t) => {
            setToken(t);
            setStep(2);
          }}
        />
      )}
    </Stack>
  );
}

function ResetPasswordPage() {
  return <ResetPassword />;
}

export default ResetPasswordPage;
