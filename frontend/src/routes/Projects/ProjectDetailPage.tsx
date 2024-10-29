import { Check } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useParams } from "wouter";
import OrgCard from "../../components/Cards/OrgCard.tsx";
import MarkdownViewer from "../../components/MarkdownViewer.tsx";
import {
  useProjectsDetailGet,
  useProjectsDetailMembersDelete,
  useProjectsDetailMembersGet,
  useProjectsDetailMembersPut,
} from "../../queries/project_hooks.ts";
import { useSessionGet } from "../../queries/sesssion_hooks.ts";
import AuthorizeProjects from "./components/AuthorizeProjects.tsx";
import ProjectMember, { MemberRoles } from "./components/ProjectMember.tsx";

function ProjectInfo(props: { project_id: number }) {
  const { project_id } = props;
  const { data: project } = useProjectsDetailGet({ project_id });

  if (!project) {
    return <Skeleton />;
  }

  return (
    <Stack gap={2}>
      {project.project_archived ? (
        <Alert severity="warning">
          Proyek ini sudah diarsipkan oleh pengurus dan tidak lagi menerima lamaran anggota baru.
        </Alert>
      ) : null}
      <Typography
        variant="h4"
        fontWeight={"bold"}
        align="center"
        sx={{
          wordBreak: "break-word",
        }}
      >
        {project.project_name}
      </Typography>
      <Typography align="center">{project.project_desc}</Typography>
      <MarkdownViewer>{project.project_content ?? ""}</MarkdownViewer>
      <Stack direction={"row"} justifyContent={"center"} spacing={2}>
        {project.project_categories.map((category, index) => (
          <Chip key={index} label={category.category_name} />
        ))}
      </Stack>
      <Typography variant="h5" fontWeight="bold" textAlign={"center"}>
        Organisasi
      </Typography>
      <Box width={200} marginX={"auto"}>
        <OrgCard org_id={project.org_id}></OrgCard>
      </Box>
      <Typography variant="h5" fontWeight={"bold"} textAlign={"center"} mb={1}>
        Anggota
      </Typography>
      <Grid container width={"75%"} margin={"0 auto"} spacing={2}>
        {project.project_members
          .filter((x) => x.role === "Admin" || x.role === "Dev")
          .map((x, i) => {
            return (
              <Grid
                key={i}
                size={{
                  xs: 12,
                  md: 6,
                  lg: 4,
                }}
              >
                <ProjectMember project_id={project_id} user_id={x.user_id} />
              </Grid>
            );
          })}
      </Grid>
    </Stack>
  );
}

function InvitedDialog(props: { project_id: number; user_id: number }) {
  const { project_id, user_id } = props;
  const [open, setOpen] = useState(true);

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
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>Terima Undangan?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Anda diundang oleh pengurus proyek ini untuk ikut berpartisipasi. Anda dapat menerima atau
          menolak undangan ini.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            deleteMember();
          }}
        >
          Tolak
        </Button>
        <Button
          onClick={() => {
            putMember({
              role: "Dev",
            });
          }}
        >
          Terima
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ApplyButton(props: { project_id: number; user_id: number; role: MemberRoles }) {
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

function ProjectLoggedIn(props: { project_id: number; user_id: number }) {
  const { project_id, user_id } = props;
  const { data: membership } = useProjectsDetailMembersGet({
    project_id: project_id,
    user_id: user_id,
  });
  const role = membership?.role;

  if (role == undefined) {
    return <Skeleton />;
  }

  if (role === "Admin" || role === "Dev") {
    return <ProjectInfo project_id={project_id} />;
  }
  if (role === "Not Involved" || role === "Pending") {
    return (
      <Box>
        <ApplyButton user_id={user_id} project_id={project_id} role={role} />
        <ProjectInfo project_id={project_id} />
      </Box>
    );
  }

  if (role === "Invited") {
    return (
      <>
        <InvitedDialog project_id={project_id} user_id={user_id} />
        <ProjectInfo project_id={project_id} />
      </>
    );
  }
}

function ProjectDetailPage() {
  const { project_id: id } = useParams();
  const project_id = Number(id);

  const { data: user_data } = useSessionGet();

  return (
    <AuthorizeProjects allowedRoles={["Not Involved"]}>
      {user_data && user_data.logged ? (
        <ProjectLoggedIn project_id={project_id} user_id={user_data.user_id} />
      ) : (
        <ProjectInfo project_id={project_id} />
      )}
    </AuthorizeProjects>
  );
}

export default ProjectDetailPage;
