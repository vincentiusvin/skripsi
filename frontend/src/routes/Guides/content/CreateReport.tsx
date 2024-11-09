import { Box, Stack, Typography } from "@mui/material";
import ActualStyledLink from "../../../components/ActualStyledLink.tsx";
import { ContentType } from "../type.tsx";

const CreateReport: ContentType = {
  title: "Panduan Pengajuan Laporan",
  steps: [
    {
      title: "Syarat pengajuan laporan",
      content: (
        <Typography>
          Apabila anda menemukan penyalahgunaan aplikasi yang dilakukan oleh anggota lain, anda
          dapat membuat laporan kepada pengurus website.
        </Typography>
      ),
    },
    {
      title: 'Buka halaman laporan pada bagian "Jelajah" di sidebar.',
      content: (
        <Box>
          <Typography
            sx={{
              display: "inline",
            }}
          >
            Atau anda dapat menekan{" "}
          </Typography>
          <ActualStyledLink to={"/reports"}>link ini</ActualStyledLink>.
        </Box>
      ),
    },
    {
      title: 'Tekan tombol "Buat Laporan Baru" di halaman laporan',
      content: null,
    },
    {
      title: "Isi informasi mengenai penyalahgunaan aplikasi yang anda temukan.",
      content: null,
    },
    {
      title: "Kumpulkan laporan penyalahgunaan kepada pengelola website",
      content: (
        <Stack>
          <Typography>
            Pengelola website akan melakukan investigasi mengenai laporan yang anda buat.
          </Typography>
          <Typography>
            Apabila pengelola website membutuhkan informasi tambahan, anda mungkin akan dikontak
            melalui chat.
          </Typography>
          <Typography mt={2}>
            Apabila ditemukan penyalahgunaan, akun pengguna yang anda laporkan mungkin akan menerima
            penangguhan.
          </Typography>
        </Stack>
      ),
    },
  ],
};

export default CreateReport;
