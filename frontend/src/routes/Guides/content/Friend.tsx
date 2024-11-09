import { Typography } from "@mui/material";
import { ContentType } from "../type.tsx";

const Friend: ContentType = {
  title: "Panduan Mengelola Teman",
  steps: [
    {
      title: "Untuk menambahkan teman, buka halaman pengguna yang ingin anda tambahkan.",
      content: (
        <Typography>
          Anda juga dapat mencari teman menggunakan fitur &quot;Cari Teman&quot; di sidebar
          &quot;Jelajah&quot;.
        </Typography>
      ),
    },
    {
      title: 'Tekan tombol "Tambahkan Sebagai Teman"',
      content: (
        <Typography>Pengguna tersebut lalu dapat menerima atau menolak permintaan anda.</Typography>
      ),
    },
    {
      title: 'Untuk mengelola teman anda, buka halaman profil anda lalu pilih tab "Teman"',
      content: (
        <Typography>
          Anda dapat mengubah pengaturan di sidebar &quot;Preferensi&quot; untuk hanya menerima
          pesan masuk dari teman anda.
        </Typography>
      ),
    },
  ],
};

export default Friend;
