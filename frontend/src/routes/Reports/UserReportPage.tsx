import { Add } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  FormControl,
  InputLabel,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import dayjs from "dayjs";
import { Redirect } from "wouter";
import reportImg from "../../assets/report.png";
import StyledLink from "../../components/StyledLink.tsx";
import { restrictToEnum } from "../../helpers/misc.ts";
import { useStateSearch } from "../../helpers/search.ts";
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

const validStatus = ["Semua", "Pending", "Rejected", "Resolved"] as const;
type ValidStatus = (typeof validStatus)[number];

function UserReport(props: { user_id: number }) {
  const { user_id } = props;

  const [_status, setStatus] = useStateSearch<ValidStatus>("status");
  let status: ValidStatus = "Semua";
  if (restrictToEnum(_status, validStatus)) {
    status = _status;
  }

  const { data: reports_raw } = useReportsGet({
    user_id,
    status: status !== "Semua" ? status : undefined,
  });
  const reports = reports_raw?.result;

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
      <Typography flexGrow={1} variant="h6">
        Laporan Anda ({reports_raw.total})
      </Typography>
      <Box>
        <FormControl>
          <InputLabel>Status</InputLabel>
          <Select
            size="small"
            value={status}
            label="Status"
            onChange={(e) => {
              setStatus(e.target.value as "Semua" | "Pending" | "Rejected" | "Resolved");
            }}
          >
            <MenuItem value={"Semua"}>Semua</MenuItem>
            <MenuItem value={"Pending"}>Menunggu</MenuItem>
            <MenuItem value={"Rejected"}>Ditolak</MenuItem>
            <MenuItem value={"Resolved"}>Diterima</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {reports.length === 0 ? (
        <Typography variant="h6" textAlign={"center"}>
          {status === "Semua"
            ? "Anda belum pernah membuat laporan!"
            : "Tidak menemukan laporan dengan kriteria tersebut!"}
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
