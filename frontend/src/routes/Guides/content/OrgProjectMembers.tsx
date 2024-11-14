import { Alert, Box, Typography } from "@mui/material";
import ActualStyledLink from "../../../components/ActualStyledLink.tsx";
import { ContentType } from "../type.tsx";

const OrgProjectMembers: ContentType = {
  title: "Panduan Mengelola Anggota Proyek",
  steps: [
    {
      title:
        "Pastikan anda sudah mendaftarkan proyek anda di sini dan sudah menjadi pengelola proyek.",
      content: (
        <Box>
          <Typography
            sx={{
              display: "inline",
            }}
          >
            Anda dapat mempelajari tentang cara mendaftarkan proyek dengan membaca{" "}
          </Typography>
          <ActualStyledLink to={"/guides/org-project"}>panduan ini</ActualStyledLink>.
        </Box>
      ),
    },
    {
      title: 'Buka halaman "Anggota" pada sidebar proyek.',
      content: (
        <Alert severity="info">
          Apabila menu tersebut tidak muncul pada sidebar anda, anda dapat mengganti konteks sidebar
          ke proyek yang bersangkutan dengan menekan tombol dropdown di bagian atas sidebar.
        </Alert>
      ),
    },
    {
      title: "Kelola anggota proyek anda.",
      content: (
        <Typography>
          Anda dapat menerima atau menolak undangan yang masuk, mengundang anggota baru, dan
          mengelola anggota yang masih aktif.
        </Typography>
      ),
    },
  ],
};

export default OrgProjectMembers;
