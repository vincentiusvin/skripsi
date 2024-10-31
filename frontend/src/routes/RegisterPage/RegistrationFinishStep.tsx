import { Box, Stack, Typography } from "@mui/material";

function RegistrationFinishStep() {
  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" textAlign="center" mb={2}>
        Selamat, akun anda telah terbuat!
      </Typography>
      <Stack direction="row" spacing={2}>
        <Typography variant="body1" flexGrow={1}>
          Apabila anda ingin mendaftarkan organisasi nirlaba anda di sini, baca lebih lanjut di
          sini.
        </Typography>
        <Typography flexGrow={1}>
          Apabila anda ingin mulai berkontribusi dalam proyek nirlaba yang sudah ada, baca lebih
          lanjut di sini.
        </Typography>
      </Stack>
    </Box>
  );
}
export default RegistrationFinishStep;
