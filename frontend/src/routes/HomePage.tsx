import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { DateCalendar, PickersDay } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import devImg from "../assets/dev.jpg";
import helpImg from "../assets/help.jpg";
import schedImg from "../assets/sched.jpg";
import StyledLink from "../components/StyledLink.tsx";
import { useOrgDetailGet, useOrgsDetailMembersGet, useOrgsGet } from "../queries/org_hooks.ts";
import {
  useProjectsDetailGet,
  useProjectsDetailMembersGet,
  useProjectsGet,
} from "../queries/project_hooks.ts";
import { useSessionGet } from "../queries/sesssion_hooks.ts";
import { useTasksGet, useTasksToProject } from "../queries/task_hooks.ts";

function ProjectRow(props: { user_id: number; project_id: number }) {
  const { user_id, project_id } = props;
  const { data: role } = useProjectsDetailMembersGet({
    project_id,
    user_id,
  });
  const { data: project } = useProjectsDetailGet({
    project_id,
  });
  if (project == undefined || role == undefined) {
    return (
      <TableRow>
        <TableCell>
          <Skeleton />
        </TableCell>
        <TableCell>
          <Skeleton />
        </TableCell>
        <TableCell>
          <Skeleton />
        </TableCell>
        <TableCell>
          <Skeleton />
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell>{project.project_name}</TableCell>
      <TableCell>{role.role}</TableCell>
      <TableCell>
        <Chip color="success" label="Aktif" />
      </TableCell>
      <TableCell>
        <StyledLink to={`/projects/${project_id}`}>
          <Button>Buka</Button>
        </StyledLink>
      </TableCell>
    </TableRow>
  );
}

function OrgRow(props: { user_id: number; org_id: number }) {
  const { user_id, org_id } = props;
  const { data: role } = useOrgsDetailMembersGet({
    org_id,
    user_id,
  });
  const { data: projects } = useProjectsGet({
    org_id,
  });
  const { data: org } = useOrgDetailGet({
    id: org_id,
  });

  if (org == undefined || role == undefined || projects == undefined) {
    return (
      <TableRow>
        <TableCell>
          <Skeleton />
        </TableCell>
        <TableCell>
          <Skeleton />
        </TableCell>
        <TableCell>
          <Skeleton />
        </TableCell>
        <TableCell>
          <Skeleton />
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell>{org.org_name}</TableCell>
      <TableCell>{role.role}</TableCell>
      <TableCell>{projects.length}</TableCell>
      <TableCell>
        <StyledLink to={`/orgs/${org_id}`}>
          <Button>Buka</Button>
        </StyledLink>
      </TableCell>
    </TableRow>
  );
}

function ProjectInfoCard(props: { user_id: number }) {
  const { user_id } = props;
  const { data: projects } = useProjectsGet({
    user_id,
  });

  if (!projects) {
    return <Skeleton />;
  }

  return (
    <Card
      sx={{
        overflow: "auto",
      }}
    >
      <CardContent
        sx={{
          minWidth: "fit-content",
        }}
      >
        <Stack
          direction={"column"}
          sx={{
            height: 400,
          }}
        >
          <Typography variant="h6">Proyek Anda</Typography>
          <Typography variant="h4" fontWeight={"bold"} mb={4}>
            {projects.length} proyek
          </Typography>
          {projects.length === 0 ? (
            <>
              <Box flexGrow={1}></Box>
              <Typography
                sx={{
                  textAlign: "center",
                }}
              >
                Anda belum terlibat dalam proyek apapun. Temukan projek yang tersedia di sini.
              </Typography>
              <Box flexGrow={1}></Box>
            </>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nama Organisasi</TableCell>
                    <TableCell>Peran</TableCell>
                    <TableCell>Status Proyek</TableCell>
                    <TableCell>Link</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((x) => (
                    <ProjectRow
                      key={x.project_id}
                      project_id={x.project_id}
                      user_id={user_id}
                    ></ProjectRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function OrgInfoCard(props: { user_id: number }) {
  const { user_id } = props;
  const { data: orgs } = useOrgsGet({
    user_id,
  });

  if (!orgs) {
    return <Skeleton />;
  }

  return (
    <Card
      sx={{
        overflow: "auto",
      }}
    >
      <CardContent
        sx={{
          minWidth: "fit-content",
        }}
      >
        <Stack
          direction={"column"}
          sx={{
            height: 400,
          }}
        >
          <Typography variant="h6">Organisasi Anda</Typography>
          <Typography variant="h4" fontWeight={"bold"} mb={4}>
            {orgs.length} organisasi
          </Typography>
          {orgs.length === 0 ? (
            <>
              <Box flexGrow={1}></Box>
              <Typography
                sx={{
                  textAlign: "center",
                }}
              >
                Anda belum terlibat dalam organisasi manapun. Anda dapat menjadi pengurus organisasi
                apabila diundang.
              </Typography>
              <Box flexGrow={1}></Box>
            </>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nama Proyek</TableCell>
                    <TableCell>Peran</TableCell>
                    <TableCell>Jumlah Proyek</TableCell>
                    <TableCell>Link</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orgs.map((x) => (
                    <OrgRow key={x.org_id} org_id={x.org_id} user_id={user_id}></OrgRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function TaskRow(props: { task_id: number }) {
  const { task_id } = props;
  const { data: task_complete } = useTasksToProject({ task_id });
  const { task, project, bucket } = task_complete;

  if (!task.data || !project.data || !bucket.data) {
    return (
      <TableRow>
        <TableCell>
          <Skeleton />
        </TableCell>
        <TableCell>
          <Skeleton />
        </TableCell>
        <TableCell>
          <Skeleton />
        </TableCell>
        <TableCell>
          <Skeleton />
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell>{project.data.project_name}</TableCell>
      <TableCell>{task.data.name}</TableCell>
      <TableCell>{bucket.data.name}</TableCell>
      <TableCell>
        {task.data.end_at != undefined
          ? dayjs(task.data.end_at).format("ddd[,] D[/]M[/]YY HH:mm")
          : "Tidak ada"}
      </TableCell>
      <TableCell>
        <StyledLink to={`/projects/${project.data.project_id}/tasks`}>
          <Button>Buka</Button>
        </StyledLink>
      </TableCell>
    </TableRow>
  );
}

function TaskInfoCard(props: { user_id: number }) {
  const { user_id } = props;
  const { data: tasks } = useTasksGet({
    user_id,
  });

  if (!tasks) {
    return <Skeleton />;
  }

  const sortedTasks = tasks.sort((a, b) => {
    const a_val = a.end_at ? new Date(a.end_at).valueOf() : Infinity;
    const b_val = b.end_at ? new Date(b.end_at).valueOf() : Infinity;

    if (a_val === b_val) {
      return a.id - b.id;
    }
    return a_val - b_val;
  });

  return (
    <Card
      sx={{
        overflow: "auto",
      }}
    >
      <CardContent
        sx={{
          minWidth: "fit-content",
        }}
      >
        <Typography variant="h6">Tugas Anda</Typography>
        <Typography variant="h4" fontWeight={"bold"} mb={4}>
          {sortedTasks.length} tugas
        </Typography>
        <Grid container>
          <Grid
            size={{
              xs: 12,
              lg: 9,
            }}
          >
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Proyek</TableCell>
                    <TableCell>Nama Tugas</TableCell>
                    <TableCell>Kategori</TableCell>
                    <TableCell>Tanggal Selesai</TableCell>
                    <TableCell>Link</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedTasks.map((x) => (
                    <TaskRow task_id={x.id} key={x.id} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 3,
            }}
          >
            <DateCalendar
              slots={{
                day: (args) => {
                  const taskDay = sortedTasks.filter((task) => {
                    if (task.end_at == undefined) {
                      return false;
                    }
                    if (args.day.isSame(task.end_at, "day")) {
                      return true;
                    }
                  });

                  return (
                    <Badge
                      color={"primary"}
                      badgeContent={taskDay.length > 0 ? taskDay.length : undefined}
                      overlap="circular"
                    >
                      <PickersDay {...args} />
                    </Badge>
                  );
                },
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

function AuthenticatedHomePage(props: { user_id: number }) {
  const { user_id } = props;
  return (
    <Grid container spacing={4}>
      <Grid size={12}>
        <TaskInfoCard user_id={user_id} />
      </Grid>
      <Grid
        size={{
          md: 6,
          xs: 12,
        }}
      >
        <ProjectInfoCard user_id={user_id} />
      </Grid>
      <Grid
        size={{
          md: 6,
          xs: 12,
        }}
      >
        <OrgInfoCard user_id={user_id} />
      </Grid>
    </Grid>
  );
}

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
  return (
    <Box>
      <Typography marginBottom={2} variant="h4" fontWeight="bold">
        Pengembangan Terbaru
      </Typography>
    </Box>
  );
}

function NewestProjects() {
  const { data: projects } = useProjectsGet();

  if (projects == undefined) {
    return (
      <Box>
        <Typography marginBottom={2} variant="h4" fontWeight="bold">
          Proyek Terbaru
        </Typography>
        <Skeleton />
      </Box>
    );
  }

  return (
    <Box>
      <Typography marginBottom={2} variant="h4" fontWeight="bold">
        Proyek Terbaru
      </Typography>
      <Stack direction="row">
        {projects.map((x) => (
          <Box key={x.project_id}>
            <Typography>{x.project_name}</Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

function UnauthenticatedHomePage() {
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

function HomePage() {
  const { data: session_data } = useSessionGet();
  if (session_data?.logged) {
    return <AuthenticatedHomePage user_id={session_data.user_id} />;
  }
  return <UnauthenticatedHomePage />;
}

export default HomePage;
