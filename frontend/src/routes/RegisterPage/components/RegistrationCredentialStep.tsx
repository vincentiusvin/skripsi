import { Button, Stack, TextField, Typography } from "@mui/material";
import { useDebounce } from "use-debounce";
import StyledLink from "../../../components/StyledLink.tsx";
import { handleOptionalStringCreation } from "../../../helpers/misc.ts";
import { useUserValidation } from "../../../queries/user_hooks.ts";
import { useRegistrationContext } from "./context.tsx";

function RegistrationCredentialStep(props: { cont: () => void }) {
  const [reg, setReg] = useRegistrationContext();
  const { cont } = props;

  const [debouncedData] = useDebounce(
    {
      email: handleOptionalStringCreation(reg.email),
      name: handleOptionalStringCreation(reg.username),
    },
    300,
  );

  const { data: valid } = useUserValidation(debouncedData);

  return (
    <Stack spacing={4}>
      <Typography variant="h5" fontWeight={"bold"} textAlign={"center"}>
        Daftar
      </Typography>
      <TextField
        value={reg.email}
        onChange={(e) => {
          setReg((x) => ({
            ...x,
            email: e.target.value,
          }));
        }}
        error={valid?.email != undefined}
        helperText={valid?.email}
        required
        label="Email"
        fullWidth
      />
      <TextField
        required
        fullWidth
        error={valid?.name != undefined}
        helperText={valid?.name}
        value={reg.username}
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
        value={reg.password}
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
        onClick={() => {
          cont();
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
