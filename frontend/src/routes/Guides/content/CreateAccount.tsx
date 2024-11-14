import { Box, Stack, Typography } from "@mui/material";
import ActualStyledLink from "../../../components/ActualStyledLink.tsx";
import { ContentType } from "../type.tsx";

const CreateAccount: ContentType = {
  title: "Panduan Pendaftaran Akun",
  steps: [
    {
      title: "Buka halaman register",
      content: (
        <Box>
          <Typography
            sx={{
              display: "inline",
            }}
          >
            Anda dapat membukanya lewat{" "}
          </Typography>
          <ActualStyledLink to={"/register"}>link ini</ActualStyledLink>.
        </Box>
      ),
    },
    { title: "Masukkan informasi dan data diri anda", content: null },
    {
      title: "Verifikasi email melalui kode OTP",
      content: <Typography>Kode OTP akan dikirimkan melalui e-mail yang didaftarkan.</Typography>,
    },
    {
      title: "Proses pendaftaran akun selesai!",
      content: (
        <Stack>
          <Typography mb={2}>Anda dapat login menggunakan akun baru anda.</Typography>
          <Box>
            <Typography
              sx={{
                display: "inline",
              }}
            >
              Apabila anda merupakan pengurus organisasi anda dapat membaca lebih lanjut tentang
              cara mendaftarkan organiasasi anda{" "}
            </Typography>
            <ActualStyledLink to={"/guides/org-create"}>di sini</ActualStyledLink>.
          </Box>
          <Box>
            <Typography
              sx={{
                display: "inline",
              }}
            >
              Apabila anda merupakan developer anda dapat membaca lebih lanjut tentang cara mulai
              berkontribusi{" "}
            </Typography>
            <ActualStyledLink to={"/guides/dev-project"}>di sini</ActualStyledLink>.
          </Box>
        </Stack>
      ),
    },
  ],
};

export default CreateAccount;
