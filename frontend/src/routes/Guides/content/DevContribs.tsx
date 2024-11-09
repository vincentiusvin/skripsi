import { Alert, Box, Stack, Typography } from "@mui/material";
import ActualStyledLink from "../../../components/ActualStyledLink.tsx";
import { ContentType } from "../type.tsx";

const DevContribs: ContentType = {
  title: "Panduan Mengajukan Kontribusi",
  steps: [
    {
      title: "Buka halaman proyek di mana anda tergabung menjadi anggota.",
      content: null,
    },
    {
      title: 'Tekan tombol "Kontribusi" di sidebar',
      content: null,
    },
    {
      title: 'Tekan tombol "Tambah Kontribusi" di halaman tersebut',
      content: null,
    },
    {
      title: "Isi informasi kontribusi anda.",
      content: (
        <Stack>
          <Typography>
            Anda dapat menyertakan media pendukung mengenai kontribusi anda seperti screenshot,
            tautan ke website lain atau cuplikan kode.
          </Typography>
          <Typography>
            Anda juga dapat menambahkan anggota lain yang ikut terlibat dalam kontribusi tersebut.
          </Typography>
          <Alert
            severity="warning"
            sx={{
              marginTop: 2,
            }}
          >
            Anda tidak boleh mencantumkan informasi yang bersifat rahasia atau tidak benar dalam
            laporan kontribusi anda.
          </Alert>
        </Stack>
      ),
    },
    {
      title: "Kumpulkan laporan kontribusi anda kepada pengurus organisasi.",
      content: (
        <Stack>
          <Typography>
            Laporan anda akan ditinjau oleh pengurus organisasi, dan apabila diterima dapat dilihat
            secara publik di profil anda.
          </Typography>
          <Box mt={2}>
            <Typography
              mt={2}
              sx={{
                display: "inline",
              }}
            >
              Apabila anda yakin terdapat kesalahan dalam pemrosesan laporan kontribusi anda, anda
              dapat melaporkan hal tersebut kepada pengurus website. Baca lebih lengkap tentang
              proses pelaporan{" "}
            </Typography>
            <ActualStyledLink to={"/guides/report"}>di sini</ActualStyledLink>.
          </Box>
        </Stack>
      ),
    },
  ],
};

export default DevContribs;
