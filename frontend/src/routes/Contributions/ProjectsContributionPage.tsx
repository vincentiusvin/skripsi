import { Add } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useParams } from "wouter";
import { z } from "zod";
import charityImg from "../../assets/charity.png";
import ContribList from "../../components/Cards/ContribList.tsx";
import QueryPagination from "../../components/QueryPagination.tsx";
import useQueryPagination from "../../components/QueryPagination/hook.ts";
import StyledLink from "../../components/StyledLink.tsx";
import { useStateSearch } from "../../helpers/search.ts";
import { useContributionsGet } from "../../queries/contribution_hooks.ts";
import { useSessionGet } from "../../queries/sesssion_hooks.ts";
import AuthorizeProjects from "../Projects/components/AuthorizeProjects.tsx";

function ProjectsContribution(props: { project_id: number }) {
  const { project_id } = props;
  const limit = 10;

  const [page, setPage] = useQueryPagination();
  const [_status, setStatus] = useStateSearch("status");
  const parsed = z.enum(["All", "Approved", "Rejected", "Pending", "Revision"]).safeParse(_status);
  const status = parsed.success ? parsed.data : "All";
  const [mine, setMine] = useStateSearch("personal");
  const { data: session } = useSessionGet();

  let user_id = undefined;
  if (mine === "true" && session?.logged) {
    user_id = session.user_id;
  }

  const { data: contributions_raw } = useContributionsGet({
    project_id,
    limit,
    page,
    user_id,
    status: status === "All" ? undefined : status,
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
      <Stack direction={"row"} alignItems={"center"} flexWrap={"wrap"} gap={2}>
        <Typography flexGrow={1} variant="h6">
          Daftar Kontribusi
        </Typography>
        <Box mt={1}>
          <FormControl>
            <InputLabel>Status</InputLabel>
            <Select
              size="small"
              value={status}
              label="Status"
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value={"All"}>Semua</MenuItem>
              <MenuItem value={"Approved"}>Diterima</MenuItem>
              <MenuItem value={"Rejected"}>Ditolak</MenuItem>
              <MenuItem value={"Revision"}>Revisi</MenuItem>
              <MenuItem value={"Pending"}>Menunggu</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            sx={{
              ml: 2,
            }}
            label="Kontribusi Saya"
            control={
              <Switch
                checked={mine === "true"}
                onChange={(_, c) => {
                  setMine(c === true ? "true" : undefined);
                }}
              ></Switch>
            }
          />
        </Box>
      </Stack>
      {contributions.length !== 0 ? (
        contributions.map((contrib) => (
          <ContribList contribution_id={contrib.id} key={contrib.id} />
        ))
      ) : (
        <Typography textAlign={"center"}>Belum ada laporan kontribusi</Typography>
      )}
      <QueryPagination limit={limit} total={contributions_raw?.total} />
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
