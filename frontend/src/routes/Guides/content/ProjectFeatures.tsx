import { Alert, Stack, Typography } from "@mui/material";
import { ContentType } from "../type.tsx";

const ProjectFeatures: ContentType = {
  title: "Proses Pengerjaan Proyek",
  steps: [
    {
      title:
        "Apabila anda sudah terlibat sebagai pengelola ataupun kontributor dalam proyek, anda dapat mengugnakan fitur-fitur berikut:",
      content: (
        <Alert severity="info">
          Apabila menu-menu berikut tidak muncul pada sidebar anda, anda dapat mengganti konteks
          sidebar ke proyek yang bersangkutan dengan menekan tombol dropdown di bagian atas sidebar.
        </Alert>
      ),
    },
    {
      title: "Diskusi mengenai proyek.",
      content: (
        <Typography>
          Anda dapat berdikusi mengenai proyek dengan menekan tombol &quot;Diskusi&quot; di sidebar.
        </Typography>
      ),
    },
    {
      title: "Melihat tugas yang perlu dikerjakan",
      content: (
        <Stack>
          <Typography>
            Anda dapat membuka kanban board untuk melihat tugas proyek dengan menekan tombol
            &quot;Tugas&quot; di sidebar.
          </Typography>
          <Typography mt={2}>
            Anda dapat membagi pekerjaan yang perlu dilakukan kepada anggota dan melihat status
            tugas-tugas yang sedang berjalan.
          </Typography>
        </Stack>
      ),
    },
    {
      title: "Mencatat kontribusi",
      content: (
        <Typography>
          Anda dapat menambahkan bukti kontribusi ke profil anda (sebagai Developer) ataupun profil
          anggota anda (sebagai pengurus organisasi) dengan menekan tombol &quot;Kontribusi&quot; di
          sidebar.
        </Typography>
      ),
    },
  ],
};

export default ProjectFeatures;
