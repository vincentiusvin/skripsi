import {
  Add,
  Delete,
  Edit,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Save,
  SearchOutlined,
} from "@mui/icons-material";
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
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import useQueryPagination from "../../components/QueryPagination/hook.ts";
import StyledLink from "../../components/StyledLink.tsx";
import UserLabel from "../../components/UserLabel.tsx";
import { formatTimeLong } from "../../helpers/misc.ts";
import { useStateSearch } from "../../helpers/search.ts";
import {
  useSuspensionsDetailDelete,
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
        message: <Typography>Pengguna berhasil ditangguhkan!</Typography>,
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
              value={banName ?? suspension.reason}
              onChange={(e) => setBanName(e.target.value)}
            />
            <DatePicker
              value={endDate ?? dayjs(suspension.suspended_until)}
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
      <IconButton variant="outlined" onClick={() => setOpen(true)}>
        <Edit />
      </IconButton>
    </>
  );
}

function DeleteSuspension(props: { suspension_id: number }) {
  const { suspension_id } = props;
  const { mutate: deleteBan } = useSuspensionsDetailDelete({
    suspension_id,
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>Penangguhan berhasil dihapus!</Typography>,
      });
    },
  });
  return (
    <IconButton variant="outlined" onClick={() => deleteBan()}>
      <Delete />
    </IconButton>
  );
}

function SuspensionData(props: { user_id: number }) {
  const { user_id } = props;
  const { data: suspension_data } = useSuspensionsGet({
    user_id: user_id,
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
              <TableCell>{formatTimeLong(x.created_at)}</TableCell>
              <TableCell>{formatTimeLong(x.suspended_until)}</TableCell>
              <TableCell>{x.reason}</TableCell>
              <TableCell width={"fit-content"}>
                <Stack direction={"row"} spacing={1}>
                  <EditSuspension suspension_id={x.id} />
                  <DeleteSuspension suspension_id={x.id} />
                </Stack>
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
      suspended_string = formatTimeLong(max_suspension);
    } else {
      suspended_string = "Tidak ditangguhkan";
    }
  }
  const created_string = formatTimeLong(user.user_created_at);

  return (
    <>
      <TableRow key={user.user_id}>
        <TableCell>
          <StyledLink to={`/users/${user.user_id}`}>
            <UserLabel user_id={user.user_id} />
          </StyledLink>
        </TableCell>
        <TableCell>{status}</TableCell>
        <TableCell>{created_string}</TableCell>
        <TableCell>{suspended_string}</TableCell>
        <TableCell>
          {open ? (
            <IconButton variant="outlined" size="small" onClick={() => setOpen(false)}>
              <KeyboardArrowUp />
            </IconButton>
          ) : (
            <IconButton variant="outlined" size="small" onClick={() => setOpen(true)}>
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
  const limit = 10;
  const [page, setPage] = useQueryPagination();
  const [keyword, setKeyword] = useStateSearch<string>("keyword");

  const [debouncedKeyword] = useDebounce(keyword, 300);

  const { data: users_raw } = useUsersGet({
    limit,
    page,
    keyword: debouncedKeyword?.toString(),
  });
  const users = users_raw?.result;

  return (
    <Box>
      <Typography variant="h4" fontWeight={"bold"} textAlign={"center"} marginBottom={2}>
        Atur Pengguna
      </Typography>
      <Paper>
        <Toolbar
          sx={{
            display: "flex",
          }}
        >
          <Typography variant="h6" flexGrow={1}>
            Daftar Pengguna
          </Typography>
          <TextField
            size="small"
            sx={{
              my: 2,
            }}
            value={keyword}
            label={"Cari pengguna"}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined />
                  </InputAdornment>
                ),
              },
            }}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
          />
        </Toolbar>
        <TableContainer>
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
              {users != undefined ? (
                users.map((user) => <AccountRow user={user} key={user.user_id} />)
              ) : (
                <Skeleton />
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  showFirstButton
                  showLastButton
                  rowsPerPage={limit}
                  rowsPerPageOptions={[limit]}
                  count={users_raw?.total ?? -1}
                  page={page - 1}
                  onPageChange={(_, p) => {
                    setPage(p + 1);
                  }}
                ></TablePagination>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
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
