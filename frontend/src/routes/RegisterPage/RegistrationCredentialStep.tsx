import { Button, Stack, TextField, Typography } from "@mui/material";
import StyledLink from "../../components/StyledLink.tsx";
import { useRegistrationContext } from "./context.tsx";

function RegistrationCredentialStep(props: { cont: () => void }) {
  const [reg, setReg] = useRegistrationContext();
  const { cont } = props;
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
        required
        label="Email"
        fullWidth
      />
      <TextField
        required
        fullWidth
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
