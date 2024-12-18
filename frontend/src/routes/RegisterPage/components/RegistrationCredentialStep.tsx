import { Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import StyledLink from "../../../components/StyledLink.tsx";
import { useUserValidation } from "../../../queries/user_hooks.ts";
import { useRegistrationContext } from "./context.tsx";

function RegistrationCredentialStep(props: { cont: () => void }) {
  const [reg, setReg] = useRegistrationContext();
  const { cont } = props;

  const [prevEmail] = useState(reg.email);

  function continueRegis() {
    if (prevEmail !== reg.email) {
      setReg((x) => ({
        ...x,
        registration_token: "",
      }));
    }
    cont();
  }

  const { isValid, data: valid } = useUserValidation({
    email: reg.email ?? "",
    name: reg.username ?? "",
  });

  const isAllowed = isValid && reg.password !== undefined;

  return (
    <Stack spacing={4}>
      <Typography variant="h5" fontWeight={"bold"} textAlign={"center"}>
        Daftar
      </Typography>
      <TextField
        value={reg.email ?? ""}
        onChange={(e) => {
          setReg((x) => ({
            ...x,
            email: e.target.value,
          }));
        }}
        error={reg.email !== undefined && !!valid?.email}
        helperText={reg.email !== undefined ? valid?.email : undefined}
        required
        label="Email"
        fullWidth
      />
      <TextField
        required
        fullWidth
        error={reg.username !== undefined && !!valid?.name}
        helperText={reg.username !== undefined ? valid?.name : undefined}
        value={reg.username ?? ""}
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
        error={reg.password === ""}
        helperText={reg.password === "" ? "Password tidak boleh kosong!" : ""}
        value={reg.password ?? ""}
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
        disabled={!isAllowed}
        onClick={() => {
          continueRegis();
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

export default RegistrationCredentialStep;
