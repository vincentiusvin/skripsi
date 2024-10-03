import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import {
  Box,
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
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";
import UserLabel from "../../components/UserLabel.tsx";
import { useSuspensionsGet } from "../../queries/suspension_hooks.ts";
import { useUsersGet } from "../../queries/user_hooks.ts";
import AuthorizeAdmin from "./components/AuthorizeAdmins.tsx";

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
          </TableRow>
        </TableHead>
        <TableBody>
          {suspension_data.map((x) => (
            <TableRow key={x.id}>
              <TableCell>{dayjs(x.created_at).format("ddd[,] D[/]M[/]YY HH:mm")}</TableCell>
              <TableCell>{dayjs(x.suspended_until).format("ddd[,] D[/]M[/]YY HH:mm")}</TableCell>
              <TableCell>{x.reason}</TableCell>
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
                <Typography variant="h5">Daftar Penangguhan</Typography>
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
