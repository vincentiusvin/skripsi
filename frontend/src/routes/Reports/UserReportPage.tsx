import {
  Box,
  Chip,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Stack,
} from "@mui/material";
import dayjs from "dayjs";
import { ReactNode } from "react";
import { Redirect } from "wouter";
import { useReportsGet } from "../../queries/report_hooks.ts";
import { useSessionGet } from "../../queries/sesssion_hooks.ts";

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

  let status: ReactNode;
  if (report.status === "Pending") {
    status = <Chip color="warning" label="Menunggu" />;
  } else if (report.status === "Resolved") {
    status = <Chip color="success" label="Diterima" />;
  } else if (report.status === "Rejected") {
    status = <Chip color="error" label="Ditolak" />;
  }

  return (
    <ListItem>
      <ListItemButton>
        <ListItemText
          primary={report.title}
          secondary={
            <>
              <Box>Dibuat: {dayjs(report.created_at).format("ddd[,] D[/]M[/]YY HH:mm")}</Box>
              {report.resolved_at ? (
                <Box>Selesai: {dayjs(report.resolved_at).format("ddd[,] D[/]M[/]YY HH:mm")}</Box>
              ) : null}
            </>
          }
        />
        <ListItemIcon>{status}</ListItemIcon>
      </ListItemButton>
    </ListItem>
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
    <Stack>
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
