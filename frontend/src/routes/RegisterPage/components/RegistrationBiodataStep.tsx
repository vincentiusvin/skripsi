import { Button, Stack, TextField, Typography } from "@mui/material";

function RegistrationBiodataStep(props: { cont: () => void; back: () => void }) {
  const { back, cont } = props;
  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={"bold"} textAlign={"center"}>
        Lengkapi Data Diri
      </Typography>
      <TextField label="Tingkat Pendidikan" fullWidth />
      <TextField label="Sekolah/Universitas" fullWidth />
      <TextField label="Website" fullWidth />
      <TextField label="Lokasi" fullWidth />
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
