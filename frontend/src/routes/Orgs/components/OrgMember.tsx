import { Button, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { API } from "../../../../../backend/src/routes.ts";
import UserCard from "../../../components/Cards/UserCard.tsx";
import {
  useOrgsDetailMembersDelete,
  useOrgsDetailMembersGet,
  useOrgsDetailMembersPut,
} from "../../../queries/org_hooks";

type MemberRoles = API["OrgsDetailMembersDetailGet"]["ResBody"]["role"] | "Not Involved";

const RoleMapping: Record<MemberRoles, string> = {
  "Not Involved": "Tidak Terlibat",
  Admin: "Admin",
  Invited: "Diundang",
};

function OrgMember(props: {
  org_id: number;
  user_id: number;
  deleteOption?: {
    text: string;
  };
  putOption?: {
    text: string;
    role: "Admin" | "Invited";
  };
}) {
  const { user_id, org_id, deleteOption, putOption } = props;
  const { data: role_data } = useOrgsDetailMembersGet({
    user_id,
    org_id,
  });

  const { mutate: deleteMember } = useOrgsDetailMembersDelete({
    user_id,
    org_id,
  });

  const { mutate: putMember } = useOrgsDetailMembersPut({
    org_id: org_id,
    user_id: user_id,
    onSuccess: (x) => {
      const mapped = RoleMapping[x.role];

      enqueueSnackbar({
        variant: "success",
        message: <Typography>User berhasil ditambahkan sebagai {mapped}!</Typography>,
      });
    },
  });

  const sidebar = [];

  if (putOption) {
    sidebar.push(
      <Button
        key={1}
        variant="outlined"
        onClick={() => {
          putMember({
            role: putOption.role,
          });
        }}
      >
        {putOption.text}
      </Button>,
    );
  }
  if (deleteOption) {
    sidebar.push(
      <Button
        key={1}
        variant="outlined"
        onClick={() => {
          deleteMember();
        }}
      >
        {deleteOption.text}
      </Button>,
    );
  }

  return (
    <UserCard
      user_id={user_id}
      subtitle={role_data != undefined ? RoleMapping[role_data.role] : undefined}
      sidebar={sidebar.length ? sidebar : undefined}
    />
  );
}

export default OrgMember;
