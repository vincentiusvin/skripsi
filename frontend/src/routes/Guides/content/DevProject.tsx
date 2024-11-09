import { Box, Stack, Typography } from "@mui/material";
import ActualStyledLink from "../../../components/ActualStyledLink.tsx";
import { ContentType } from "../type.tsx";

const DevProject: ContentType = {
  title: "Panduan Keanggotaan Proyek",
  steps: [
    {
      title: "Buka halaman proyek",
      content: (
        <Box>
          <Typography
            sx={{
              display: "inline",
            }}
          >
            Anda dapat mencari proyek-proyek yang ada lewat{" "}
          </Typography>
          <ActualStyledLink to={"/projects"}>link ini</ActualStyledLink>.
        </Box>
      ),
    },
    {
      title: 'Tekan tombol "Kirim Permintaan Bergabung" di halaman proyek',
      content: (
        <Typography>
          Permintaan anda akan ditangani oleh pengurus proyek. Anda akan mendapatkan notifikasi
          apabila permintaan anda sudah diterima/ditolak.
        </Typography>
      ),
    },
    {
      title: "Apabila anda diterima, anda dapat mulai berkontribusi di dalam proyek!",
      content: (
        <Stack>
          <Typography>
            Anda dapat melihat tugas yang perlu dikerjakan dan berdiskusi mengenai proyek melalui
            website ini.
          </Typography>
          <Box>
            <Typography
              sx={{
                display: "inline",
              }}
            >
              Apabila anda sudah menyelesaikan sebuah pekerjaan, anda dapat mengajukan laporan
              kontribusi. Baca lebih lengkap{" "}
            </Typography>
            <ActualStyledLink to={"/guides/dev-contribs"}>di sini</ActualStyledLink>.
          </Box>
        </Stack>
      ),
    },
    {
      title: "Pastikan anda mematuhi aturan-aturan berikut dalam pengunaan website Dev4You:",
      content: (
        <Box>
          <ul>
            <li>
              <Typography>
                Anda tidak boleh menggunakan website ini untuk membuka jasa freelancing atau
                pengerjaan proyek untuk uang.
              </Typography>
            </li>
            <li>Hormati satu sama lain.</li>
            <li>
              Hormati hukum yang ada. Jangan menggunakan website ini untuk melaksanakan aktivitas
              ilegal.
            </li>
          </ul>
          Kegagalan dalam mematuhi aturan-aturan di atas dapat membuat akun anda ditangguhkan.
        </Box>
      ),
    },
  ],
};

export default DevProject;
