import { Button, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { API } from "../../../../../backend/src/routes.ts";
import UserCard from "../../../components/UserCard.tsx";
import {
  useProjectsDetailMembersDelete,
  useProjectsDetailMembersGet,
  useProjectsDetailMembersPut,
} from "../../../queries/project_hooks.ts";

export type MemberRoles = API["ProjectsDetailMembersGet"]["ResBody"]["role"] | "Not Involved";

function ProjectMember(props: {
  user_id: number;
  project_id: number;
  deleteOption?: {
    text: string;
  };
  putOption?: {
    text: string;
    role: MemberRoles;
  };
}) {
  const { user_id, project_id, putOption, deleteOption } = props;
  const { data: member_data } = useProjectsDetailMembersGet({
    user_id,
    project_id,
  });
  const { mutate: putMember } = useProjectsDetailMembersPut({
    project_id: project_id,
    user_id: user_id,
    onSuccess: (x) => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>User berhasil ditambahkan sebagai {x.role}!</Typography>,
      });
    },
  });

  const { mutate: deleteMember } = useProjectsDetailMembersDelete({
    project_id: project_id,
    user_id: user_id,
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>User berhasil dihapus!</Typography>,
      });
    },
  });

  return (
    <UserCard
      user_id={user_id}
      subtitle={member_data?.role}
      sidebar={
        <>
          {putOption && (
            <Button
              variant="outlined"
              onClick={() => {
                putMember({
                  role: putOption.role,
                });
              }}
            >
              {putOption.text}
            </Button>
          )}
          {deleteOption && (
            <Button
              variant="outlined"
              onClick={() => {
                deleteMember();
              }}
            >
              {deleteOption.text}
            </Button>
          )}
        </>
      }
    />
  );
}

export default ProjectMember;
