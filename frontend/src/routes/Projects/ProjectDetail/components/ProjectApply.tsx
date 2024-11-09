import { Add, Cancel, Check, Visibility } from "@mui/icons-material";
import { Button, Skeleton, Stack, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useNavigation } from "../../../../components/Navigation/NavigationContext.ts";
import { useOrgsDetailMembersGet } from "../../../../queries/org_hooks.ts";
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

  const { data: org_role } = useOrgsDetailMembersGet({
    org_id: project!.org_id,
    user_id,
    enabled: project != undefined,
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

  const [nav, setNav] = useNavigation();

  if (project == undefined || role == undefined) {
    return <Skeleton />;
  }

  if (role.role === "Not Involved") {
    let explain_text =
      "Anda dapat mengirimkan permintaan untuk bergabung ke dalam proyek ini. Permintaan anda harus disetujui oleh pengurus proyek sebelum anda dapat masuk.";
    let button_text = "Kirim Permintaan Bergabung";

    if (org_role?.role === "Admin") {
      explain_text =
        "Sebagai pengurus organisasi, anda dapat bergabung dalam proyek ini sebagai admin dan mulai mengelola proyek.";
      button_text = "Bergabung Sebagai Admin";
    }

    return (
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight={"bold"}>
          Bergabung
        </Typography>
        <Typography variant="caption">{explain_text}</Typography>
        <Button
          startIcon={<Add />}
          disabled={project.project_archived}
          variant="contained"
          onClick={() => {
            addMember({
              role: "Pending",
            });
          }}
        >
          {button_text}
        </Button>
      </Stack>
    );
  }

  if (role.role === "Pending") {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight={"bold"}>
          Bergabung
        </Typography>
        <Typography variant="caption">
          Anda sudah mengirimkan permintaan untuk bergabung ke dalam proyek ini. Permintaan anda
          harus disetujui oleh pengurus proyek sebelum anda dapat masuk.
        </Typography>
        <Button
          onClick={() => {
            deleteMember();
          }}
          color="error"
          startIcon={<Cancel />}
          variant="contained"
        >
          Batalkan Permintaan
        </Button>
      </Stack>
    );
  }

  if (role.role === "Invited") {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight={"bold"}>
          Bergabung
        </Typography>
        <Typography variant="caption">
          Anda diundang oleh pengurus proyek ini untuk ikut bergabung sebagai developer. Anda dapat
          mulai berkontribusi setelah menerima undangan ini.
        </Typography>
        <Button
          onClick={() => {
            addMember({
              role: "Dev",
            });
          }}
          color="success"
          startIcon={<Check />}
          variant="contained"
        >
          Terima
        </Button>
        <Button
          onClick={() => {
            deleteMember();
          }}
          color="error"
          startIcon={<Cancel />}
          variant="contained"
        >
          Tolak
        </Button>
      </Stack>
    );
  }

  if (role.role === "Admin" || role.role === "Dev") {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight={"bold"}>
          Bergabung
        </Typography>
        <Typography variant="caption">Anda merupakan anggota dari proyek ini.</Typography>
        <Button
          startIcon={<Visibility />}
          onClick={() => {
            setNav({
              type: "project",
              id: project_id,
              open: true,
            });
          }}
          disabled={nav.type === "project" && nav.id === project_id && nav.open}
          variant="contained"
        >
          Buka di Dashboard
        </Button>
      </Stack>
    );
  }
}
export default ProjectApply;
