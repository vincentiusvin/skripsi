import {
  Avatar,
  Box,
  Button,
  Skeleton,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import blobDark from "../assets/blobdark.svg";
import blobLight from "../assets/bloblight.svg";
import devImg from "../assets/dev.png";
import helpImg from "../assets/help.png";
import schedImg from "../assets/sched.png";
import ContribList from "../components/Cards/ContribList.tsx";
import ProjectCard from "../components/Cards/ProjectCard.tsx";
import StyledLink from "../components/StyledLink.tsx";
import { useContributionsGet } from "../queries/contribution_hooks.ts";
import { useProjectsGet } from "../queries/project_hooks.ts";

const landingData = [
  {
    title: "Bantu sosial, kembangkan keterampilan",
    subtitle:
      "Temukan organisasi yang membutuhkan bantuan software dan ikut terlibat langsung dalam proses pengembangan. Kontribusi anda akan tercatat secara publik.",
    img: helpImg,
    link: "/projects",
  },
  {
    title: " Butuh bantuan developer? Dapatkan disini",
    subtitle:
      "Apabila anda merupakan organisasi nirlaba yang membutuhkan bantuan pengembangan software, anda dapat memepelajari cara untuk bergabung disini.",
    img: devImg,
    link: "/orgs",
  },
  {
    title: "Gunakan fitur manajemen proyek secara gratis.",
    subtitle:
      "Jalin komunikasi dan lakukan koordinasi dengan mudah menggunakan fitur kanban board dan chat dari kami. Gratis untuk organisasi nirlaba.",
    img: schedImg,
    link: null,
  },
];

function NewestContributions() {
  const { data: contribs } = useContributionsGet();

  if (contribs == undefined) {
    return (
      <Box>
        <Typography variant="h4" fontWeight="bold">
          Kontribusi Terbaru
        </Typography>
        <Typography marginBottom={2} variant="caption">
          Terima kasih telah membantu organisasi-organisasi ini ❤️
        </Typography>
        <Skeleton />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold">
        Kontribusi Terbaru
      </Typography>
      <Typography marginBottom={2} variant="caption">
        Terima kasih telah membantu organisasi-organisasi ini ❤️
      </Typography>
      <Box marginTop={4}>
        {contribs.map((x) => (
          <ContribList key={x.id} contribution_id={x.id} hideStatus />
        ))}
      </Box>
    </Box>
  );
}

function NewestProjects() {
  const { data: projects } = useProjectsGet();

  return (
    <Box
      sx={{
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          height: "100%",
          width: "200vw",
          backgroundImage: (theme) =>
            theme.palette.mode === "dark" ? `url(${blobDark})` : `url(${blobLight})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          left: "-20%",
          zIndex: -1,
        }}
      ></Box>
      <Box
        sx={{
          paddingY: 16,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Proyek Terbaru
        </Typography>
        <Typography variant="caption">
          Proyek-proyek ini baru dimulai dan membutuhkan bantuan anda
        </Typography>
        <Grid container marginTop={4} spacing={2}>
          {projects?.map((x) => (
            <Grid
              key={x.project_id}
              size={{
                xs: 12,
                sm: 6,
                lg: 4,
              }}
            >
              <ProjectCard project_id={x.project_id} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

function HugeTitle() {
  return (
    <Box
      sx={{
        position: "relative",
        marginTop: -2,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          height: "100%",
          width: "200vw",
          backgroundImage: (theme) =>
            theme.palette.mode === "dark" ? `url(${blobDark})` : `url(${blobLight})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          left: "-20%",
          zIndex: -1,
        }}
      ></Box>
      <Stack spacing={4} paddingY={20}>
        <Typography
          variant="h2"
          fontWeight={"bold"}
          textAlign={"center"}
          sx={{
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "linear-gradient(110deg, hsl(200, 70%, 30%) 20%, hsl(270, 70%, 60%) 90%)"
                : "linear-gradient(110deg, hsl(280, 100%, 80%) 10%, hsl(200, 100%, 30%) 90%)",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Dev4You
        </Typography>
        <Typography variant="h6" fontWeight={"light"} textAlign={"center"}>
          Di mana <b>developer relawan</b> dan <b>organisasi nirlaba</b> bertemu
        </Typography>
        <Stack direction="row" justifyContent={"center"} spacing={4}>
          <Button
            variant="contained"
            sx={{
              fontSize: 16,
              paddingX: 8,
              paddingY: 1,
              backgroundColor: "white",
            }}
          >
            Masuk
          </Button>
          <Button
            sx={{
              fontSize: 16,
              paddingX: 8,
              paddingY: 1,
              background:
                "radial-gradient(274px at 7.4% 17.9%, rgb(82, 107, 248) 0.3%, rgb(167, 139, 252) 90.5%)",
            }}
            variant="contained"
          >
            Daftar
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function LandingPage() {
  const responsive = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  return (
    <Stack paddingX={`calc(15% - 24px)`}>
      <Grid
        container
        justifyContent={"center"}
        alignItems={"center"}
        rowSpacing={8}
        columnSpacing={16}
      >
        <Grid size={12}>
          <HugeTitle />
        </Grid>
        {landingData.map((x, i) => {
          const align_left = i % 2 === 0;

          const desc = (
            <Grid
              key={i + "d"}
              size={{
                xs: 12,
                md: 7,
              }}
              textAlign={align_left ? "left" : "right"}
            >
              <Typography marginBottom={2} variant="h4" fontWeight="bold">
                {x.title}
              </Typography>
              <Typography variant="body1" marginBottom={4}>
                {x.subtitle}
              </Typography>
              {x.link ? (
                <StyledLink to={x.link}>
                  <Button size="large" variant="contained">
                    Mulai Sekarang
                  </Button>
                </StyledLink>
              ) : null}
            </Grid>
          );

          const img = (
            <Grid
              key={i + "i"}
              size={{
                xs: 12,
                md: 5,
              }}
            >
              <Avatar
                sx={{
                  width: "100%",
                  height: "100%",
                }}
                variant="square"
                src={x.img}
              ></Avatar>
            </Grid>
          );

          const order = !responsive ? (align_left ? [desc, img] : [img, desc]) : desc;

          return order;
        })}
        <Grid size={12}>
          <NewestProjects />
        </Grid>
        <Grid size={12}>
          <NewestContributions />
        </Grid>
      </Grid>
    </Stack>
  );
}

export default LandingPage;
