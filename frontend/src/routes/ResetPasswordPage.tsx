import { Button, Skeleton, Stack, TextField } from "@mui/material";
import { useState } from "react";
import OTP from "../components/OTP.tsx";
import { useOTPToken } from "../queries/user_hooks.ts";

function OTPStep(props: { email: string; onVerified: (x: string) => void }) {
  const { email, onVerified } = props;

  const { data: otpToken } = useOTPToken({
    email,
    type: "Password",
  });

  if (otpToken == undefined) {
    return <Skeleton />;
  }

  return (
    <OTP
      otp={otpToken}
      onVerified={() => {
        onVerified(otpToken.token);
      }}
    />
  );
}

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [render, setRender] = useState(false);
  const [, setToken] = useState("");
  return (
    <Stack spacing={2}>
      <TextField
        label="Email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
        }}
      />
      <Button
        onClick={() => {
          setRender(true);
        }}
      >
        Mulai Reset Password
      </Button>
      {render ? (
        <OTPStep
          email={email}
          onVerified={(x) => {
            setToken(x);
          }}
        />
      ) : null}
    </Stack>
  );
}

function ResetPasswordPage() {
  return <ResetPassword />;
}

export default ResetPasswordPage;
