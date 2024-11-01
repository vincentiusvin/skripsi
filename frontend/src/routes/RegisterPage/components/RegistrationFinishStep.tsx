import { Box, Button, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";

function RegistrationFinishStep() {
  return (
    <Box>
      <Grid container rowSpacing={4} columnSpacing={16} paddingX={4}>
        <Grid size={12} textAlign="center">
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Selamat, akun anda telah terbuat!
          </Typography>
          <Typography>
            Silahkan baca panduan-panduan berikut untuk mengetahui langkah selanjutnya.
          </Typography>
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <Typography variant="h6" fontWeight={"bold"}>
            Organisasi Nirlaba
          </Typography>
          <Typography variant="body1" mb={2}>
            Untuk pengurus organisasi nirlaba yang ingin mendaftarkan organisasinya.
          </Typography>
          <Button variant="outlined">Pelajari lebih lanjut</Button>
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
          textAlign={"end"}
        >
          <Typography variant="h6" fontWeight={"bold"}>
            Developer
          </Typography>
          <Typography variant="body1" mb={2}>
            Untuk developer yang ingin mulai terlibat dalam proyek yang sudah ada.
          </Typography>
          <Button variant="outlined">Pelajari lebih lanjut</Button>
        </Grid>
      </Grid>
    </Box>
  );
}
export default RegistrationFinishStep;
