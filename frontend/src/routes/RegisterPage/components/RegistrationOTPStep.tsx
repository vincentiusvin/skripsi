import { Box, Button, OutlinedInput, Skeleton, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { OTPInput, REGEXP_ONLY_DIGITS } from "input-otp";
import { padStart } from "lodash";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useOTPToken, useOTPVerify, useOTPsResend } from "../../../queries/user_hooks.ts";
import { useRegistrationContext } from "./context.tsx";

function Timer(props: { until: dayjs.Dayjs }) {
  const { until } = props;

  const [now, setNow] = useState(dayjs());
  const diff = until.diff(now, "seconds");

  const minutes = Math.floor(diff / 60);
  const seconds = diff - minutes * 60;

  useEffect(() => {
    const id = setInterval(() => {
      setNow(dayjs());
    });

    return () => {
      clearInterval(id);
    };
  }, []);

  const fmtMins = padStart(minutes.toString(), 2, "0");
  const fmtSecs = padStart(seconds.toString(), 2, "0");

  return (
    <Typography fontWeight={"bold"}>
      {fmtMins}:{fmtSecs}
    </Typography>
  );
}

function RegistrationOTPStep(props: { cont: () => void; back: () => void }) {
  const { back, cont } = props;
  const [reg, setReg] = useRegistrationContext();

  const [otp, setOtp] = useState<string | undefined>(undefined);

  const { data: otpToken } = useOTPToken({
    email: reg.email,
  });

  const { mutate: resend } = useOTPsResend({
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: "Berhasil mengirimkan ulang email!",
      });
    },
  });

  const { mutate: _verify } = useOTPVerify({
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: "Verifikasi berhasil!",
      });
      setReg((x) => ({
        ...x,
        registration_token: otpToken!.token,
      }));
    },
  });

  function verify() {
    if (otp == undefined) {
      return enqueueSnackbar({
        variant: "error",
        message: "Anda perlu mengisi kode OTP!",
      });
    }
    if (otpToken == undefined) {
      return enqueueSnackbar({
        variant: "error",
        message: "Mohon tunggu, kode OTP anda sedang dikirim...",
      });
    }
    _verify({
      otp: otp,
      token: otpToken.token,
    });
  }

  if (otpToken == undefined) {
    return <Skeleton />;
  }

  const expired_at = dayjs(otpToken.created_at).add(15, "minute");

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
      <Box textAlign={"center"}>
        <OTPInput
          autoFocus
          value={otp ?? ""}
          maxLength={6}
          onChange={(e) => setOtp(e)}
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
          Valid selama: <Timer until={expired_at} />
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
            resend({
              token: otpToken.token,
            });
          }}
          size="small"
        >
          Kirim Ulang
        </Button>
      </Stack>
      <Stack direction="row" spacing={2}>
        <Button fullWidth onClick={() => back()} variant="outlined">
          Mundur
        </Button>
        <Button
          disabled={reg.registration_token.length === 0}
          fullWidth
          onClick={() => cont()}
          variant="contained"
        >
          Lanjut
        </Button>
      </Stack>
    </Stack>
  );
}
export default RegistrationOTPStep;
