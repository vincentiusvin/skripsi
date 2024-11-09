import { Alert, Stack, Typography } from "@mui/material";
import { ContentType } from "../type.tsx";

const OrgContribs: ContentType = {
  title: "Panduan Mengelola Kontribusi",
  steps: [
    {
      title: 'Tekan tombol "Kontribusi" di sidebar proyek',
      content: (
        <Alert severity="info">
          Apabila menu tersebut tidak muncul pada sidebar anda, anda dapat mengganti konteks sidebar
          ke proyek yang bersangkutan dengan menekan tombol dropdown di bagian atas sidebar.
        </Alert>
      ),
    },
    {
      title: "Pilih kontribusi jang ingin anda kelola",
      content: (
        <Typography>
          Sebagai pengurus organisasi, Anda juga dapat menambahkan kontribusi atas nama orang lain.
        </Typography>
      ),
    },
    {
      title: 'Berikan persetujuan dengan menekan tombol "Setuju", "Tolak", atau "Minta revisi"',
      content: (
        <Stack>
          <Typography>
            Kontribusi yang Anda setujui akan menjadi publik dan muncul di profil developer yang
            terlibat.
          </Typography>
          <Typography mt={2}>
            Anda dapat meminta revisi apabila terdapat kesalahan kecil pada laporan yang diajukan.
          </Typography>
          <Typography mt={2}>
            Anda dapat menolak laporan kontribusi yang diajukan apabila laporan tersebut mengandung
            informasi yang bersifat rahasia atau tidak benar.
          </Typography>
        </Stack>
      ),
    },
  ],
};

export default OrgContribs;
