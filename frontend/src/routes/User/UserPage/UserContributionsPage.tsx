import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useParams } from "wouter";
import { z } from "zod";
import ContribList from "../../../components/Cards/ContribList.tsx";
import QueryPagination from "../../../components/QueryPagination.tsx";
import useQueryPagination from "../../../components/QueryPagination/hook.ts";
import { useStateSearch } from "../../../helpers/search.ts";
import { useContributionsGet } from "../../../queries/contribution_hooks.ts";
import { useSessionGet } from "../../../queries/sesssion_hooks.ts";
import AuthorizeUser from "../AuthorizeUser.tsx";

function UserContributions(props: { user_id: number }) {
  const { user_id } = props;

  const [page, setPage] = useQueryPagination();
  const limit = 10;

  const { data: session } = useSessionGet();

  const [_status, setStatus] = useStateSearch("status");
  const parsed = z.enum(["All", "Approved", "Rejected", "Pending", "Revision"]).safeParse(_status);
  const status = parsed.success ? parsed.data : "Approved";

  const { data: contribs } = useContributionsGet({
    user_id,
    status: status === "All" ? undefined : status,
    limit,
    page,
  });

  if (contribs == undefined) {
    return <Skeleton />;
  }

  if (contribs.total === 0) {
    return (
      <Typography textAlign={"center"}>Pengguna ini belum memiliki laporan kontribusi.</Typography>
    );
  }

  let options = [
    <MenuItem key={"Approved"} value={"Approved"}>
      Diterima
    </MenuItem>,
  ];

  if (session?.logged) {
    if (session.is_admin || session.user_id === user_id) {
      options = [
        <MenuItem key={"All"} value={"All"}>
          Semua
        </MenuItem>,
        <MenuItem key={"Approved"} value={"Approved"}>
          Diterima
        </MenuItem>,
        <MenuItem key={"Rejected"} value={"Rejected"}>
          Ditolak
        </MenuItem>,
        <MenuItem key={"Revision"} value={"Revision"}>
          Revisi
        </MenuItem>,
        <MenuItem key={"Pending"} value={"Pending"}>
          Menunggu
        </MenuItem>,
      ];
    }
  }

  return (
    <Stack spacing={2}>
      <FormControl>
        <InputLabel>Status</InputLabel>
        <Select
          size="small"
          value={status}
          label="Status"
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          {options}
        </Select>
      </FormControl>
      {contribs.result.map((x) => (
        <ContribList contribution_id={x.id} key={x.id} />
      ))}
      <QueryPagination limit={limit} total={contribs?.total} />
    </Stack>
  );
}

function UserContributionsPage() {
  const { id } = useParams();
  const user_id = Number(id);

  return (
    <AuthorizeUser>
      <UserContributions user_id={user_id} />
    </AuthorizeUser>
  );
}

export default UserContributionsPage;
