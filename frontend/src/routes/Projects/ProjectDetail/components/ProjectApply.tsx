import { Check } from "@mui/icons-material";
import { Button, Skeleton, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import {
  useProjectsDetailGet,
  useProjectsDetailMembersDelete,
  useProjectsDetailMembersGet,
  useProjectsDetailMembersPut,
} from "../../../../queries/project_hooks.ts";

function ProjectApply(props: { project_id: number; user_id: number }) {
  const { project_id, user_id } = props;
  const { data: project } = useProjectsDetailGet({
    project_id,
  });

  const { data: role } = useProjectsDetailMembersGet({
    user_id,
    project_id,
  });

  const { mutate: addMember } = useProjectsDetailMembersPut({
    project_id: project_id,
    user_id: user_id,
    onSuccess: (x) => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>Status anda {x.role}</Typography>,
      });
    },
  });

  const { mutate: deleteMember } = useProjectsDetailMembersDelete({
    project_id: project_id,
    user_id: user_id,
    onSuccess: (x) => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>Status anda {x.role}</Typography>,
      });
    },
  });

  if (project == undefined || role == undefined) {
    return <Skeleton />;
  }

  return (
    <Button
      endIcon={<Check />}
      variant="contained"
      disabled={role.role === "Pending" || project.project_archived}
      fullWidth
      onClick={() => {
        if (role.role === "Not Involved") {
          addMember({
            role: "Pending",
          });
        }
      }}
    >
      {role.role === "Pending" ? "Applied" : "Apply"}
    </Button>
  );
}
export default ProjectApply;
