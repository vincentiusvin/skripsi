import { Skeleton, Stack, Typography } from "@mui/material";
import { useParams } from "wouter";
import ContribList from "../../../components/Cards/ContribList.tsx";
import QueryPagination from "../../../components/QueryPagination.tsx";
import useQueryPagination from "../../../components/QueryPagination/hook.ts";
import { useContributionsGet } from "../../../queries/contribution_hooks.ts";
import AuthorizeUser from "../AuthorizeUser.tsx";

function UserContributions(props: { user_id: number }) {
  const { user_id } = props;

  const [page] = useQueryPagination();
  const limit = 10;

  const { data: contribs } = useContributionsGet({
    user_id,
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

  return (
    <Stack spacing={2}>
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
