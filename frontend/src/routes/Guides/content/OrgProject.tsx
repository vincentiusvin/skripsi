import { Alert, Box, Typography } from "@mui/material";
import ActualStyledLink from "../../../components/ActualStyledLink.tsx";
import { ContentType } from "../type.tsx";

const OrgProject: ContentType = {
  title: "Panduan Membuat Proyek",
  steps: [
    {
      title: "Pastikan anda sudah mendaftarkan organisasi anda di sini.",
      content: (
        <Box>
          <Typography
            sx={{
              display: "inline",
            }}
          >
            Anda dapat mempelajari tentang cara mendaftarkan organisasi anda dengan membaca{" "}
          </Typography>
          <ActualStyledLink to={"/guides/org-create"}>panduan ini</ActualStyledLink>.
        </Box>
      ),
    },
    {
      title: 'Buka halaman "Buat Proyek Baru" pada sidebar.',
      content: (
        <Alert severity="info">
          Apabila menu tersebut tidak muncul pada sidebar anda, anda dapat mengganti konteks sidebar
          ke organisasi yang bersangkutan dengan menekan tombol dropdown di bagian atas sidebar.
        </Alert>
      ),
    },
    {
      title: "Masukkan informasi mengenai proyek anda.",
      content: (
        <Typography>
          Anda selalu dapat mengubah informasi ini dengan menekan tombol &quot;Atur Proyek&quot; di
          sidebar proyek.
        </Typography>
      ),
    },
    {
      title: "Proses pendaftaran proyek selesai!",
      content: (
        <Typography>
          Anda dapat menunggu ataupun mengundang pengguna lain untuk bergabung dalam proyek anda.
        </Typography>
      ),
    },
    {
      title: 'Tekan tombol "Bergabung Sebagai Admin" apabila anda ingin menjadi pengelola proyek.',
      content: (
        <Box>
          <Typography>
            Anda dapat langsung masuk menjadi pengelola proyek apabila anda merupakan pengurus
            organisasi yang bersangkutan.
          </Typography>
          <Typography mt={2}>
            Anda juga memiliki opsi untuk tidak melibatkan diri dan menerima notifikasi pada setiap
            proyek yang dijalankan organisasi anda dengan tidak menekan tombol tersebut.
          </Typography>
        </Box>
      ),
    },
  ],
};

export default OrgProject;
