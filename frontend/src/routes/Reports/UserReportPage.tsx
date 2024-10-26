import {
  Button,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { Redirect } from "wouter";
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
      <ListItem>
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
        Laporan Anda
      </Typography>
      <StyledLink to={"/reports/add"}>
        <Button fullWidth variant="contained">
          Buat Laporan Baru
        </Button>
      </StyledLink>
      {reports.map((x) => (
        <ReportEntry report={x} key={x.id} />
      ))}
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
