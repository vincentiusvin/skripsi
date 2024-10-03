import { Add, Edit, KeyboardArrowDown, KeyboardArrowUp, Save } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import UserLabel from "../../components/UserLabel.tsx";
import {
  useSuspensionsDetailGet,
  useSuspensionsDetailPut,
  useSuspensionsGet,
  useSuspensionsPost,
} from "../../queries/suspension_hooks.ts";
import { useUsersGet } from "../../queries/user_hooks.ts";
import AuthorizeAdmin from "./components/AuthorizeAdmins.tsx";

function AddSuspension(props: { user_id: number; user_name: string }) {
  const { user_id, user_name } = props;
  const [open, setOpen] = useState(false);
  const [banName, setBanName] = useState("");
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);
  const { mutate: ban } = useSuspensionsPost({
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: "Pengguna berhasil ditangguhkan!",
      }),
        setOpen(false);
    },
  });

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Tambah Penangguhan - {user_name}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} marginTop={2}>
            <TextField
              label="Alasan"
              value={banName}
              onChange={(e) => setBanName(e.target.value)}
            />
            <DatePicker
              value={endDate}
              onChange={(x) => setEndDate(x)}
              label="Tanggal Selesai"
            ></DatePicker>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={() => {
              if (endDate == undefined) {
                enqueueSnackbar({
                  variant: "error",
                  message: <Typography>Anda perlu menambahkan tanggal selesai!</Typography>,
                });
                return;
              }
              ban({
                reason: banName,
                suspended_until: endDate.toISOString(),
                user_id,
              });
            }}
          >
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
      <Button variant="contained" onClick={() => setOpen(true)} startIcon={<Add />}>
        Tambah
      </Button>
    </>
  );
}

function EditSuspension(props: { suspension_id: number }) {
  const { suspension_id } = props;
  const [open, setOpen] = useState(false);
  const [banName, setBanName] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null | undefined>();
  const { mutate: edit } = useSuspensionsDetailPut({
    suspension_id,
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: "Penangguhan berhasil diupdate!",
      }),
        setOpen(false);
    },
  });
  const { data: suspension } = useSuspensionsDetailGet({
    suspension_id,
  });

  if (!suspension) {
    return <Skeleton />;
  }

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Ubah Penangguhan</DialogTitle>
        <DialogContent>
          <Stack spacing={2} marginTop={2}>
            <TextField
              label="Alasan"
              value={banName}
              onChange={(e) => setBanName(e.target.value)}
              defaultValue={suspension.reason}
            />
            <DatePicker
              value={endDate}
              onChange={(x) => setEndDate(x)}
              label="Tanggal Selesai"
              defaultValue={dayjs(suspension.suspended_until)}
            ></DatePicker>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={() => {
              edit({
                reason: banName,
                suspended_until: endDate?.toISOString(),
              });
            }}
          >
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
      <IconButton onClick={() => setOpen(true)}>
        <Edit />
      </IconButton>
    </>
  );
}

function SuspensionData(props: { user_id: number }) {
  const { user_id } = props;
  const { data: suspension_data } = useSuspensionsGet({
    user_id: user_id,
    expired_after: dayjs().startOf("day"),
  });

  if (suspension_data == undefined) {
    return <Skeleton />;
  }

  if (suspension_data.length === 0) {
    return <Typography variant="body1">Pengguna ini belum pernah ditangguhkan!</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Tanggal Mulai</TableCell>
            <TableCell>Tanggal Selesai</TableCell>
            <TableCell>Alasan</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {suspension_data.map((x) => (
            <TableRow key={x.id}>
              <TableCell>{dayjs(x.created_at).format("ddd[,] D[/]M[/]YY HH:mm")}</TableCell>
              <TableCell>{dayjs(x.suspended_until).format("ddd[,] D[/]M[/]YY HH:mm")}</TableCell>
              <TableCell>{x.reason}</TableCell>
              <TableCell>
                <EditSuspension suspension_id={x.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function AccountRow(props: {
  user: {
    user_id: number;
    user_name: string;
    user_is_admin: boolean;
    user_email: string | null;
    user_education_level: string | null;
    user_school: string | null;
    user_about_me: string | null;
    user_image: string | null;
    user_created_at: Date;
  };
}) {
  const { user } = props;
  const { data: suspension_data } = useSuspensionsGet({
    user_id: user.user_id,
    expired_after: dayjs().startOf("day"),
  });
  const [open, setOpen] = useState(false);

  let status = <Skeleton />;

  if (user.user_is_admin) {
    status = <Chip label="Administrator" color="primary" />;
  } else if (suspension_data != undefined) {
    if (suspension_data.length) {
      status = <Chip label="Ditangguhkan" color="warning" />;
    } else {
      status = <Chip label="Aktif" color="success" />;
    }
  }
  let suspended_string = "Memuat...";

  if (suspension_data) {
    if (suspension_data.length) {
      const max_suspension = suspension_data
        .map((x) => dayjs(x.suspended_until))
        .reduce((x, v) => (x.isAfter(v) ? x : v));
      suspended_string = dayjs(max_suspension).format("ddd[,] D[/]M[/]YY HH:mm");
    } else {
      suspended_string = "Tidak ditangguhkan";
    }
  }
  const created_string = dayjs(user.user_created_at).format("ddd[,] D[/]M[/]YY HH:mm");

  return (
    <>
      <TableRow key={user.user_id}>
        <TableCell>
          <UserLabel user_id={user.user_id} />
        </TableCell>
        <TableCell>{status}</TableCell>
        <TableCell>{created_string}</TableCell>
        <TableCell>{suspended_string}</TableCell>
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
                <Stack direction={"row"} spacing={4} alignItems={"center"}>
                  <Typography variant="h5">Daftar Penangguhan</Typography>
                  <AddSuspension user_id={user.user_id} user_name={user.user_name} />
                </Stack>
                <Divider
                  sx={{
                    marginBottom: 2,
                  }}
                />
                <SuspensionData user_id={user.user_id} />
              </Box>
            </Stack>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function ManageAccounts() {
  const { data: users } = useUsersGet();

  if (!users) {
    return <Skeleton />;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Pengguna</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Aktif Sejak</TableCell>
            <TableCell>Ditangguhkan Hingga</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <AccountRow user={user} key={user.user_id} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function ManageAccountsPage() {
  return (
    <AuthorizeAdmin>
      <ManageAccounts />
    </AuthorizeAdmin>
  );
}

export default ManageAccountsPage;
