import { Button, Stack, TextField, Typography } from "@mui/material";
import { useRegistrationContext } from "./context.tsx";

function RegistrationBiodataStep(props: { cont: () => void; back: () => void }) {
  const { back, cont } = props;
  const [reg, setReg] = useRegistrationContext();
  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={"bold"} textAlign={"center"}>
        Lengkapi Data Diri
      </Typography>
      <TextField
        label="Tingkat Pendidikan"
        fullWidth
        value={reg.education ?? ""}
        onChange={(e) => {
          setReg((x) => ({
            ...x,
            education: e.target.value,
          }));
        }}
      />
      <TextField
        label="Sekolah/Universitas"
        fullWidth
        value={reg.school ?? ""}
        onChange={(e) => {
          setReg((x) => ({
            ...x,
            school: e.target.value,
          }));
        }}
      />
      <TextField
        label="Website"
        fullWidth
        value={reg.website ?? ""}
        onChange={(e) => {
          setReg((x) => ({
            ...x,
            website: e.target.value,
          }));
        }}
      />
      <TextField
        label="Lokasi"
        fullWidth
        value={reg.location ?? ""}
        onChange={(e) => {
          setReg((x) => ({
            ...x,
            location: e.target.value,
          }));
        }}
      />
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

export default RegistrationBiodataStep;
