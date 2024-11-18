import { Box, Button, OutlinedInput, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { OTPInput, REGEXP_ONLY_DIGITS } from "input-otp";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useOTPVerify, useOTPsResend } from "../queries/user_hooks.ts";
import Timer from "./Timer.tsx";

function OTP(props: {
  otp: {
    type: "Register" | "Password";
    created_at: Date;
    email: string;
    used_at: Date | null;
    verified_at: Date | null;
    token: string;
  };
  onVerified?: () => void;
}) {
  const { onVerified, otp } = props;
  const token = otp.token;

  const { mutate: resend } = useOTPsResend({
    token,
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: "Berhasil mengirimkan ulang email!",
      });
    },
  });

  const { mutate: _verify } = useOTPVerify({
    token,
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: "Verifikasi berhasil!",
      });
      if (onVerified) {
        onVerified();
      }
    },
  });

  function verify() {
    if (otpCode == undefined) {
      return enqueueSnackbar({
        variant: "error",
        message: "Anda perlu mengisi kode OTP!",
      });
    }
    _verify({
      otp: otpCode,
    });
  }

  const expired_at = dayjs(otp.created_at).add(15, "minute");
  const finished_at = otp.verified_at != undefined ? dayjs(otp.verified_at) : undefined;
  const [otpCode, setOtpCode] = useState<undefined | string>();

  return (
    <Stack spacing={4}>
      <Typography variant="h5" fontWeight={"bold"} textAlign={"center"}>
        Kode OTP
      </Typography>
      <Box textAlign={"center"}>
        <Typography>
          Kami telah mengirim kode OTP ke alamat email anda di <b>{otp.email}</b>.
        </Typography>
        <Typography>Silahkan masukkan kode tersebut ke sini:</Typography>
      </Box>
      <Box textAlign={"center"}>
        <OTPInput
          autoFocus
          value={otp.verified_at != null ? "******" : otpCode ?? ""}
          disabled={otp.verified_at != null}
          maxLength={6}
          onChange={(e) => {
            setOtpCode(e);
          }}
          inputMode="numeric"
          pattern={REGEXP_ONLY_DIGITS}
          onComplete={verify}
          render={({ slots }) => (
            <Stack direction="row" gap={1} justifyContent={"center"} flexWrap={"wrap"}>
              {slots.map((x, i) => (
                <OutlinedInput
                  sx={{
                    width: 36,
                  }}
                  slotProps={{
                    input: {
                      sx: {
                        textAlign: "center",
                        paddingX: 0,
                        margin: 0,
                      },
                    },
                  }}
                  size="small"
                  className={x.isActive ? "Mui-focused" : undefined}
                  value={x.char ?? ""}
                  key={i}
                ></OutlinedInput>
              ))}
            </Stack>
          )}
        />
        <Box mt={1}>
          Valid selama: <Timer frozen_at={finished_at} until={expired_at} />
        </Box>
      </Box>
      <Stack
        direction="row"
        gap={1}
        flexWrap={"wrap"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <Typography variant="body2">Tidak menerima email tersebut?</Typography>
        <Button
          onClick={() => {
            resend();
          }}
          size="small"
          disabled={otp.verified_at != null}
        >
          Kirim Ulang
        </Button>
      </Stack>
    </Stack>
  );
}

export default OTP;
