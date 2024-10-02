import { Edit, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { enqueueSnackbar } from "notistack";
import { stringify } from "qs";
import { useState } from "react";
import StyledLink from "../../components/StyledLink.tsx";
import UserLabel from "../../components/UserLabel.tsx";
import { useReportsGet, useReportsPut } from "../../queries/report_hooks.ts";
import AuthorizeAdmin from "./components/AuthorizeAdmins.tsx";

const statusColor = {
  Pending: "warning",
  Rejected: "error",
  Resolved: "success",
} as const;

function ResolveReport(props: {
  report_id: number;
  old_value?: string;
  onSubmit?: () => void;
  showReset?: boolean;
}) {
  const { report_id, old_value, onSubmit, showReset } = props;
  const { mutate: update } = useReportsPut({
    report_id: report_id,
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>Laporan berhasil diubah!</Typography>,
      });
      if (onSubmit) {
        onSubmit();
      }
    },
  });

  const [resolution, setResolution] = useState(old_value);
  return (
    <Box>
      <TextField
        multiline
        minRows={2}
        label="Penjelasan"
        onChange={(e) => {
          setResolution(e.target.value);
        }}
        value={resolution}
      />

      <Stack direction={"row"} spacing={2} marginTop={2}>
        <Button
          variant="contained"
          color="success"
          onClick={() => {
            update({
              resolution,
              status: "Resolved",
            });
          }}
        >
          Terima
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            update({
              resolution,
              status: "Rejected",
            });
          }}
        >
          Tolak
        </Button>
        {showReset ? (
          <Button
            variant="contained"
            color="warning"
            onClick={() => {
              update({
                status: "Pending",
              });
            }}
          >
            Reset
          </Button>
        ) : null}
      </Stack>
    </Box>
  );
}

function ChatroomReport(props: { chatroom_id?: number; report_id: number }) {
  const { report_id, chatroom_id } = props;

  const { mutate: update } = useReportsPut({
    report_id: report_id,
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>Ruang berhasil ditambahkan!</Typography>,
      });
    },
  });

  if (chatroom_id != undefined) {
    const chatroom_params = stringify(
      {
        room: chatroom_id,
      },
      {
        addQueryPrefix: true,
      },
    );
    return (
      <StyledLink to={`/chatrooms${chatroom_params}`}>
        <Button variant="contained">Buka Ruang Diskusi</Button>
      </StyledLink>
    );
  } else {
    return (
      <Button
        variant="contained"
        onClick={() => {
          update({
            chatroom: true,
          });
        }}
      >
        Tambah Ruang Diskusi
      </Button>
    );
  }
}

function ReportRow(props: {
  report: {
    chatroom_id: number | null;
    id: number;
    sender_id: number;
    title: string;
    description: string;
    status: "Pending" | "Rejected" | "Resolved";
    created_at: Date;
    resolved_at: Date | null;
    resolution: string | null;
  };
}) {
  const { report } = props;
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell>{report.title}</TableCell>
        <TableCell>
          <UserLabel user_id={report.sender_id} />
        </TableCell>
        <TableCell>
          <Chip label={report.status} color={statusColor[report.status]} />
        </TableCell>
        <TableCell>{dayjs(report.created_at).format("ddd[,] D[/]M[/]YY HH:mm")}</TableCell>
        <TableCell>
          {report.resolved_at
            ? dayjs(report.resolved_at).format("ddd[,] D[/]M[/]YY HH:mm")
            : "Belum selesai"}
        </TableCell>
        <TableCell>
          {open ? (
            <IconButton size="small" onClick={() => setOpen(false)}>
              <KeyboardArrowUp />
            </IconButton>
          ) : (
            <IconButton size="small" onClick={() => setOpen(true)}>
              <KeyboardArrowDown />
            </IconButton>
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={6} sx={{ paddingBottom: 0, paddingTop: 0 }}>
          <Collapse in={open}>
            <Stack sx={{ paddingBottom: 2, paddingTop: 2 }} spacing={2}>
              <Box>
                <Typography variant="h5">Informasi Tambahan</Typography>
                <Divider
                  sx={{
                    marginBottom: 2,
                  }}
                />
                <Typography variant="body1">{report.description}</Typography>
              </Box>
              <Box>
                <Typography variant="h5">Diskusi</Typography>
                <Divider
                  sx={{
                    marginBottom: 2,
                  }}
                />
                <ChatroomReport
                  chatroom_id={report.chatroom_id ?? undefined}
                  report_id={report.id}
                />
              </Box>
              <Box>
                <Stack direction={"row"} spacing={2} alignItems={"center"} marginBottom={1}>
                  <Typography variant="h5">Resolusi</Typography>
                  {report.status !== "Pending" ? (
                    <IconButton size="small" onClick={() => setIsEditing(!isEditing)}>
                      <Edit />
                    </IconButton>
                  ) : null}
                </Stack>
                <Divider
                  sx={{
                    marginBottom: 1,
                  }}
                />
                {report.status === "Pending" || isEditing ? (
                  <ResolveReport
                    showReset={report.status !== "Pending"}
                    report_id={report.id}
                    old_value={report.resolution ?? undefined}
                    onSubmit={() => setIsEditing(false)}
                  />
                ) : (
                  <Box>
                    <Typography variant="body1">{report.resolution}</Typography>
                  </Box>
                )}
              </Box>
            </Stack>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function HandleReports() {
  const { data: reports } = useReportsGet({});

  if (!reports) {
    return <Skeleton />;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nama Laporan</TableCell>
            <TableCell>Dibuat Oleh</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Tanggal Diterima</TableCell>
            <TableCell>Tanggal Selesai</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {reports.map((report) => (
            <ReportRow report={report} key={report.id} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function HandleReportsPage() {
  return (
    <AuthorizeAdmin>
      <HandleReports />
    </AuthorizeAdmin>
  );
}

export default HandleReportsPage;
