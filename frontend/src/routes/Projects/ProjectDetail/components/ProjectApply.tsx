import { Check } from "@mui/icons-material";
import { Button, Skeleton, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import {
  useProjectsDetailGet,
  useProjectsDetailMembersPut,
} from "../../../../queries/project_hooks.ts";
import { MemberRoles } from "../../components/ProjectMember.tsx";

function ProjectApply(props: { project_id: number; user_id: number; role: MemberRoles }) {
  const { project_id, user_id, role } = props;
  const { data: project } = useProjectsDetailGet({
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

  if (project == undefined) {
    return <Skeleton />;
  }

  if (role !== "Not Involved" && role !== "Pending") {
    return null;
  }

  return (
    <Button
      endIcon={<Check />}
      variant="contained"
      disabled={role === "Pending" || project.project_archived}
      fullWidth
      onClick={() => {
        if (role === "Not Involved") {
          addMember({
            role: "Pending",
          });
        }
      }}
    >
      {role === "Pending" ? "Applied" : "Apply"}
    </Button>
  );
}
export default ProjectApply;
