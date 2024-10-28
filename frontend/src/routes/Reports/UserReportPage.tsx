import { Add } from "@mui/icons-material";
import {
  Avatar,
  Button,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import dayjs from "dayjs";
import { Redirect } from "wouter";
import reportImg from "../../assets/report.png";
import StyledLink from "../../components/StyledLink.tsx";
import { useReportsGet } from "../../queries/report_hooks.ts";
import { useSessionGet } from "../../queries/sesssion_hooks.ts";
import ReportStatusChip from "./components/ReportStatus.tsx";

function ReportEntry(props: {
  report: {
    id: number;
    sender_id: number;
    chatroom_id: number | null;
    title: string;
    description: string;
    status: "Pending" | "Rejected" | "Resolved";
    created_at: Date;
    resolved_at: Date | null;
    resolution: string | null;
  };
}) {
  const { report } = props;

  return (
    <StyledLink to={`/reports/${report.id}`}>
      <ListItem disableGutters>
        <ListItemButton>
          <ListItemText
            primary={report.title}
            secondary={
              <>
                Dibuat: {dayjs(report.created_at).format("ddd[,] D[/]M[/]YY HH:mm")}
                {report.resolved_at ? (
                  <>
                    <br />
                    Selesai: {dayjs(report.resolved_at).format("ddd[,] D[/]M[/]YY HH:mm")}
                  </>
                ) : null}
              </>
            }
          />
          <ListItemIcon>
            <ReportStatusChip status={report.status} />
          </ListItemIcon>
        </ListItemButton>
      </ListItem>
    </StyledLink>
  );
}

function UserReport(props: { user_id: number }) {
  const { user_id } = props;
  const { data: reports } = useReportsGet({
    user_id,
  });

  if (!reports) {
    return <Skeleton />;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={"bold"} textAlign={"center"}>
        Laporan
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
            <Typography marginBottom={4}>
              Apabila anda menemukan penyalahgunaan aplikasi atau menerima perlakuan yang tidak
              wajar, anda dapat membuat laporan kepada pengelola website.
            </Typography>
            <Typography marginBottom={2}>
              Pengelola website akan melakukan investigasi dan memberikan sanksi kepada pengguna
              yang bersangkutan apabila ditemukan penyalahgunaan.
            </Typography>
            <StyledLink to={"/reports/add"}>
              <Button startIcon={<Add />} variant="contained">
                Buat Laporan Baru
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
              src={reportImg}
            ></Avatar>
          </Grid>
        </Grid>
      </Paper>
      <Typography variant="h6">Daftar Laporan</Typography>
      {reports.length === 0 ? (
        <Typography variant="h6" textAlign={"center"}>
          Anda belum pernah membuat laporan!
        </Typography>
      ) : (
        reports.map((x) => <ReportEntry report={x} key={x.id} />)
      )}
    </Stack>
  );
}

function UserReportPage() {
  const { data: sessionData } = useSessionGet();

  if (!sessionData) {
    return <Skeleton />;
  }

  if (sessionData.logged === false) {
    return <Redirect to={"/"} />;
  } else {
    return <UserReport user_id={sessionData.user_id} />;
  }
}
export default UserReportPage;
