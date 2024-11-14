import { Alert, Box, Typography } from "@mui/material";
import ActualStyledLink from "../../../components/ActualStyledLink.tsx";
import { ContentType } from "../type.tsx";

const OrgOrgMembers: ContentType = {
  title: "Panduan Mengelola Pengurus Organisasi",
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
            Anda dapat mempelajari tentang cara mendaftarkan organisasi dengan membaca{" "}
          </Typography>
          <ActualStyledLink to={"/guides/org-create"}>panduan ini</ActualStyledLink>.
        </Box>
      ),
    },
    {
      title: 'Buka halaman "Pengurus" pada sidebar organisasi.',
      content: (
        <Alert severity="info">
          Apabila menu tersebut tidak muncul pada sidebar anda, anda dapat mengganti konteks sidebar
          ke organisasi yang bersangkutan dengan menekan tombol dropdown di bagian atas sidebar.
        </Alert>
      ),
    },
    {
      title: "Kelola anggota organisasi anda.",
      content: (
        <Box>
          <Typography mb={2}>
            Anda dapat mengundang pengurus baru untuk masuk ke dalam organisasi anda.
          </Typography>
          <Alert severity="warning">
            Pengurus yang anda undang akan memiliki akses yang sama dengan anda, pastikan anda hanya
            mengundang orang-orang yang anda percayai.
          </Alert>
        </Box>
      ),
    },
  ],
};

export default OrgOrgMembers;
