import { Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import StyledLink from "../StyledLink.tsx";

const helps = [
  {
    name: "Umum",
    entries: [
      {
        text: "Membuat akun",
        link: "def",
      },
      {
        text: "Pengerjaan proyek",
        link: "def",
      },
      {
        text: "Menambahkan teman",
        link: "def",
      },
      {
        text: "Mengajukan laporan",
        link: "def",
      },
    ],
  },
  {
    name: "Untuk Developer",
    entries: [
      {
        text: "Menjadi anggota proyek",
        link: "def",
      },
      {
        text: "Mengajukan laporan kontribusi",
        link: "def",
      },
    ],
  },
  {
    name: "Untuk Nirlaba",
    entries: [
      {
        text: "Membuat organisasi",
        link: "def",
      },
      {
        text: "Membuat proyek",
        link: "def",
      },
      {
        text: "Menambah anggota proyek",
        link: "def",
      },
    ],
  },
];

function Footer() {
  return (
    <Grid
      container
      mt={4}
      sx={{
        paddingY: 8,
        backgroundColor: (theme) =>
          theme.palette.mode === "dark" ? theme.palette.primary.dark : theme.palette.primary.main,
        paddingX: `calc(15% - 48px)`,
      }}
      spacing={2}
    >
      <Grid size={6} alignSelf={"center"}>
        <Typography variant="h4" fontWeight={"bold"}>
          Dev4You
        </Typography>
      </Grid>
      {helps.map((x, i) => (
        <Grid size={2} key={i}>
          <Typography variant="h6" marginBottom={1} fontWeight={"bold"}>
            {x.name}
          </Typography>
          {x.entries.map((y, j) => (
            <StyledLink key={j} to={y.link}>
              <Typography
                sx={{
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
                variant="body2"
              >
                {y.text}
              </Typography>
            </StyledLink>
          ))}
        </Grid>
      ))}
    </Grid>
  );
}

export default Footer;
