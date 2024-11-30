import { Add } from "@mui/icons-material";
import { Avatar, Button, Paper, Skeleton, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useParams } from "wouter";
import charityImg from "../../assets/charity.png";
import ContribList from "../../components/Cards/ContribList.tsx";
import StyledLink from "../../components/StyledLink.tsx";
import { useContributionsGet } from "../../queries/contribution_hooks.ts";
import AuthorizeProjects from "../Projects/components/AuthorizeProjects.tsx";

function ProjectsContribution(props: { project_id: number }) {
  const { project_id } = props;
  const { data: contributions_raw } = useContributionsGet({
    project_id,
  });
  const contributions = contributions_raw?.result;

  if (contributions == undefined) {
    return <Skeleton />;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={"bold"} textAlign={"center"} marginBottom={2}>
        Kontribusi
      </Typography>
      <Paper
        sx={{
          padding: 4,
        }}
      >
        <Grid
          container
          alignItems={"center"}
          spacing={{
            md: 16,
          }}
          paddingX={{ md: 8 }}
        >
          <Grid
            size={{
              xs: 12,
              md: 8,
            }}
          >
            <Typography marginBottom={2}>
              Anda dapat mengajukan laporan kontribusi kepada pengurus organisasi untuk ditampilkan
              secara publik di profil anda.
            </Typography>
            <Typography marginBottom={2}>
              Laporan kontribusi yang diajukan perlu disetujui terlebih dahulu oleh pengurus
              organisasi yang bersangkutan sebelum menjadi publik.
            </Typography>
            <StyledLink to={`/projects/${project_id}/add-contribs`}>
              <Button variant="contained" startIcon={<Add />}>
                Tambah Kontribusi
              </Button>
            </StyledLink>
          </Grid>
          <Grid size={{ md: 4, xs: 0 }} display={{ md: "block", xs: "none" }}>
            <Avatar
              sx={{
                width: "100%",
                height: "100%",
              }}
              variant="square"
              src={charityImg}
            ></Avatar>
          </Grid>
        </Grid>
      </Paper>
      <Typography variant="h6">Daftar Kontribusi</Typography>
      {contributions.length !== 0 ? (
        contributions.map((contrib) => (
          <ContribList contribution_id={contrib.id} key={contrib.id} />
        ))
      ) : (
        <Typography textAlign={"center"}>Belum ada laporan kontribusi</Typography>
      )}
    </Stack>
  );
}

function ProjectsContributionPage() {
  const { project_id: id } = useParams();
  const project_id = Number(id);

  return (
    <AuthorizeProjects allowedRoles={["Admin", "Dev"]}>
      <ProjectsContribution project_id={project_id} />
    </AuthorizeProjects>
  );
}

export default ProjectsContributionPage;
