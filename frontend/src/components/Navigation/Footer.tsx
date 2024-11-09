import { Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import StyledLink from "../StyledLink.tsx";

const helps = [
  {
    name: "Umum",
    entries: [
      {
        text: "Membuat akun",
        link: "/guides/account",
      },
      {
        text: "Pengerjaan proyek",
        link: "/guides/project-features",
      },
      {
        text: "Menambahkan teman",
        link: "/guides/friend",
      },
      {
        text: "Melaporkan penyalahgunaan",
        link: "/guides/report",
      },
    ],
  },
  {
    name: "Untuk Developer",
    entries: [
      {
        text: "Menjadi anggota proyek",
        link: "/guides/dev-project",
      },
      {
        text: "Mengajukan laporan kontribusi",
        link: "/guides/dev-contribs",
      },
    ],
  },
  {
    name: "Untuk Nirlaba",
    entries: [
      {
        text: "Membuat organisasi",
        link: "/guides/org-create",
      },
      {
        text: "Membuat proyek",
        link: "/guides/org-project",
      },
      {
        text: "Menambah anggota proyek",
        link: "/guides/org-project-members",
      },
      {
        text: "Menambah pengurus organisasi",
        link: "/guides/org-org-members",
      },
    ],
  },
];

function Footer() {
  return (
    <Grid
      container
      mt={4}
      mx={-2}
      sx={{
        paddingY: 8,
        backgroundColor: (theme) =>
          theme.palette.mode === "dark" ? theme.palette.primary.dark : theme.palette.primary.main,
        paddingX: `calc(15% - 24px)`,
      }}
      spacing={2}
    >
      <Grid
        size={{
          xs: 12,
          md: 6,
        }}
        alignSelf={"center"}
      >
        <Typography variant="h4" fontWeight={"bold"}>
          Dev4You
        </Typography>
      </Grid>
      {helps.map((x, i) => (
        <Grid
          size={{
            xs: 12,
            md: 2,
          }}
          key={i}
        >
          <Typography
            variant="h6"
            marginBottom={1}
            fontWeight={"bold"}
            sx={{
              wordBreak: "break-word",
            }}
          >
            {x.name}
          </Typography>
          {x.entries.map((y, j) => (
            <StyledLink key={j} to={y.link}>
              <Typography
                sx={{
                  "&:hover": {
                    textDecoration: "underline",
                  },
                  wordBreak: "break-word",
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
