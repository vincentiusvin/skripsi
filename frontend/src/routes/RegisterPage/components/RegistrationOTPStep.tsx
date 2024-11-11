import { Box, Button, OutlinedInput, Stack, Typography } from "@mui/material";
import { OTPInput, REGEXP_ONLY_DIGITS } from "input-otp";
import { useState } from "react";
import { useRegistrationContext } from "./context.tsx";

function RegistrationOTPStep(props: { cont: () => void; back: () => void }) {
  const { back, cont } = props;
  const [reg] = useRegistrationContext();

  const [otp, setOtp] = useState<string | undefined>(undefined);

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
      <Box>
        <OTPInput
          maxLength={6}
          onChange={(e) => setOtp(e)}
          inputMode="numeric"
          pattern={REGEXP_ONLY_DIGITS}
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
      </Box>
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
