import { Box, Typography } from "@mui/material";
import ActualStyledLink from "../../../components/ActualStyledLink.tsx";
import { ContentType } from "../type.tsx";

const OrgCreate: ContentType = {
  title: "Panduan Membuat Organisasi",
  steps: [
    {
      title: "Buka halaman daftar organisasi",
      content: (
        <Box>
          <Typography
            sx={{
              display: "inline",
            }}
          >
            Atau anda dapat menekan{" "}
          </Typography>
          <ActualStyledLink to={"/orgs"}>link ini</ActualStyledLink>.
        </Box>
      ),
    },
    {
      title: 'Tekan tombol "Daftarkan Organisasi"',
      content: null,
    },
    {
      title: "Masukkan informasi mengenai organisasi anda.",
      content: (
        <Typography>
          Anda selalu dapat mengubah informasi ini dengan menekan tombol &quot;Atur Organisasi&quot;
          di sidebar.
        </Typography>
      ),
    },
    {
      title: "Proses pendaftaran organisasi selesai!",
      content: null,
    },
    {
      title: "Pastikan anda mematuhi aturan-aturan berikut dalam pengunaan website Dev4You:",
      content: (
        <Box>
          <ul>
            <li>
              <Typography>
                Anda tidak boleh menggunakan website ini untuk menjalankan proyek yang bersifat
                untuk laba.
              </Typography>
            </li>
            <li>
              <Typography
                sx={{
                  display: "inline",
                }}
              >
                Anda tidak boleh menolak laporan kontribusi kecuali jika laporan tersebut mengandung
                informasi yang bersifat rahasia ataupun palsu. Baca lebih lengkap{" "}
              </Typography>
              <ActualStyledLink to={"/guides/org-contribs"}>di sini</ActualStyledLink>.
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

export default OrgCreate;
