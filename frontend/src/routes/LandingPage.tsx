import { Avatar, Box, Button, Skeleton, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import devImg from "../assets/dev.jpg";
import helpImg from "../assets/help.jpg";
import schedImg from "../assets/sched.jpg";
import ContribList from "../components/Cards/ContribList.tsx";
import ProjectCard from "../components/Cards/ProjectCard.tsx";
import { useContributionsGet } from "../queries/contribution_hooks.ts";
import { useProjectsGet } from "../queries/project_hooks.ts";

const landingData = [
  {
    title: "Bantu sosial, kembangkan keterampilan",
    subtitle:
      "Temukan organisasi yang membutuhkan bantuan software dan ikut terlibat langsung dalam proses pengembangan. Kontribusi anda akan tercatat secara publik.",
    img: helpImg,
  },
  {
    title: " Butuh bantuan developer? Dapatkan disini",
    subtitle:
      "Apabila anda merupakan organisasi nirlaba yang membutuhkan bantuan pengembangan software, anda dapat memepelajari cara untuk bergabung disini.",
    img: devImg,
  },
  {
    title: "Gunakan fitur manajemen proyek secara gratis.",
    subtitle:
      "Jalin komunikasi dan lakukan koordinasi dengan mudah menggunakan fitur kanban board dan chat dari kami. Gratis untuk organisasi nirlaba.",
    img: schedImg,
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

  if (projects == undefined) {
    return (
      <Box>
        <Typography variant="h4" fontWeight="bold">
          Proyek Terbaru
        </Typography>
        <Typography variant="caption">
          Proyek-proyek ini baru dimulai dan membutuhkan bantuan anda
        </Typography>
        <Skeleton />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold">
        Proyek Terbaru
      </Typography>
      <Typography variant="caption">
        Proyek-proyek ini baru dimulai dan membutuhkan bantuan anda
      </Typography>
      <Grid container marginTop={4} spacing={2}>
        {projects.map((x) => (
          <Grid key={x.project_id} size={4}>
            <ProjectCard project_id={x.project_id} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function LandingPage() {
  return (
    <Stack height={"100%"} paddingX={24}>
      <Grid container justifyContent={"center"} alignItems={"center"} rowGap={8} columnSpacing={16}>
        {landingData.map((x, i) => {
          const align_left = i % 2 === 0;

          const desc = (
            <Grid size={7} textAlign={align_left ? "left" : "right"}>
              <Typography marginBottom={2} variant="h4" fontWeight="bold">
                {x.title}
              </Typography>
              <Typography variant="body1" marginBottom={4}>
                {x.subtitle}
              </Typography>
              <Button size="large" variant="contained">
                Mulai Sekarang
              </Button>
            </Grid>
          );

          const img = (
            <Grid size={5}>
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

          const order = align_left ? [desc, img] : [img, desc];

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
