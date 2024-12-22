import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from "@mui/lab";
import { Box, Button, Skeleton, Stack, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useParams } from "wouter";
import StyledLink from "../../components/StyledLink.tsx";
import { formatTimeShort } from "../../helpers/misc.ts";
import { useReportsDetailGet } from "../../queries/report_hooks.ts";
import AuthorizeReports from "./components/AuthorizeReports.tsx";
import ReportStatusChip from "./components/ReportStatus.tsx";

function ReportChatroomButton(props: { chatroom_id: null | number }) {
  const { chatroom_id } = props;
  if (chatroom_id != undefined) {
    return (
      <StyledLink to={`/chatroom-forwarder/${chatroom_id}`}>
        <Button variant="contained">Ruang Diskusi</Button>
      </StyledLink>
    );
  } else {
    return (
      <Tooltip title="Admin akan membuat ruang diskusi apabila dibutuhkan informasi tambahan selama investigasi">
        <Box>
          <Button variant="contained" disabled>
            Ruang Diskusi
          </Button>
        </Box>
      </Tooltip>
    );
  }
}

function UserReportDetail(props: { report_id: number }) {
  const { report_id } = props;

  const { data: report } = useReportsDetailGet({
    report_id,
  });

  if (!report) {
    return <Skeleton />;
  }

  const report_created_at = dayjs(report.created_at);
  const report_resolved_at = report.resolved_at != null ? dayjs(report.resolved_at) : null;

  return (
    <Stack textAlign={"center"} spacing={2}>
      <Typography variant="h5" fontWeight={"bold"}>
        {report.title}
      </Typography>
      <Box>
        <ReportStatusChip status={report.status} />
      </Box>
      <Typography variant="body1">{report.description}</Typography>
      <Box>
        <ReportChatroomButton chatroom_id={report.chatroom_id} />
      </Box>
      <Box>
        {report.status === "Pending" ? (
          <StyledLink to={`/reports/${report_id}/edit`}>
            <Button variant="contained">Edit</Button>
          </StyledLink>
        ) : (
          <Button disabled variant="contained">
            Edit
          </Button>
        )}
      </Box>
      <Timeline>
        <TimelineItem>
          <TimelineOppositeContent>
            <Typography>{formatTimeShort(report_created_at)}</Typography>
            <Typography>{report_created_at.format("HH:mm")}</Typography>
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>Dibuat</TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot color="warning" />
            {report.status !== "Pending" ? <TimelineConnector /> : null}
          </TimelineSeparator>
          <TimelineContent>
            <Typography>Menunggu persetujuan administrator</Typography>
            <Typography variant="caption">
              Administrator akan melakukan investigasi berdasarkan informasi yang anda berikan.
              <br />
              Anda mungkin akan dihubungi melalui chat apabila dibutuhkan informasi tambahan.
            </Typography>
          </TimelineContent>
        </TimelineItem>
        {report.status === "Rejected" ? (
          <TimelineItem>
            {report_resolved_at ? (
              <TimelineOppositeContent>
                <Typography>{formatTimeShort(report_resolved_at)}</Typography>
                <Typography>{report_resolved_at.format("HH:mm")}</Typography>
              </TimelineOppositeContent>
            ) : null}
            <TimelineSeparator>
              <TimelineDot color="error" />
            </TimelineSeparator>
            <TimelineContent>
              <Typography>Laporan ditolak oleh administrator</Typography>
              <Typography variant="caption">
                Administrator memberikan tanggapan berikut:
                <br />
                {report.resolution}
              </Typography>
            </TimelineContent>
          </TimelineItem>
        ) : report.status === "Resolved" ? (
          <TimelineItem>
            {report_resolved_at ? (
              <TimelineOppositeContent>
                <Typography>{formatTimeShort(report_resolved_at)}</Typography>
                <Typography>{report_resolved_at.format("HH:mm")}</Typography>
              </TimelineOppositeContent>
            ) : null}
            <TimelineSeparator>
              <TimelineDot color="success" />
            </TimelineSeparator>
            <TimelineContent>
              <Typography>Laporan disetujui oleh administrator</Typography>
              <Typography variant="caption">
                Administrator memberikan tanggapan berikut:
                <br />
                {report.resolution}
              </Typography>
            </TimelineContent>
          </TimelineItem>
        ) : null}
      </Timeline>
    </Stack>
  );
}

function UserReportDetailPage() {
  const { report_id: id } = useParams();
  const report_id = Number(id);

  return (
    <AuthorizeReports>
      <UserReportDetail report_id={report_id} />
    </AuthorizeReports>
  );
}

export default UserReportDetailPage;
