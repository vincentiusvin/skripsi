import {
  Chip,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import dayjs from "dayjs";
import UserLabel from "../../components/UserLabel.tsx";
import { useSuspensionsGet } from "../../queries/suspension_hooks.ts";
import { useUsersGet } from "../../queries/user_hooks.ts";
import AuthorizeAdmin from "./components/AuthorizeAdmins.tsx";

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
    expired_after: dayjs().startOf("day").add(1, "day"),
  });

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

  return (
    <TableRow key={user.user_id}>
      <TableCell>
        <UserLabel user_id={user.user_id} />
      </TableCell>
      <TableCell>{status}</TableCell>
      <TableCell>{dayjs(user.user_created_at).format("ddd[,] D[/]M[/]YY HH:mm")}</TableCell>
    </TableRow>
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
