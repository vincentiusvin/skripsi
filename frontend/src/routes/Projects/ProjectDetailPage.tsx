import { Check } from "@mui/icons-material";
import { Box, Button, Chip, Skeleton, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import { useParams } from "wouter";
import OrgCard from "../../components/Cards/OrgCard.tsx";
import {
  useProjectsDetailGet,
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

function InvolvedView(props: { project_id: number; user_id: number; role: MemberRoles }) {
  const { project_id } = props;

  return <ProjectInfo project_id={project_id} />;
}

function UninvolvedView(props: { project_id: number; user_id: number; role: MemberRoles }) {
  const { project_id, user_id, role } = props;

  const { data: project } = useProjectsDetailGet({
    project_id: project_id,
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

  if (!project) {
    return <Skeleton />;
  }

  return (
    <Stack>
      <Button
        endIcon={<Check />}
        variant="contained"
        disabled={role === "Admin" || role === "Dev"}
        fullWidth
        onClick={() => {
          if (role === "Not Involved") {
            addMember({
              role: "Pending",
            });
          } else if (role === "Invited") {
            addMember({
              role: "Dev",
            });
          }
        }}
      >
        {role === "Invited" ? "Accept" : role === "Pending" ? "Applied" : "Apply"}
      </Button>
      <ProjectInfo project_id={project_id} />
    </Stack>
  );
}

function UnauthenticatedView(props: { project_id: number }) {
  const { project_id } = props;

  const { data: project } = useProjectsDetailGet({
    project_id: project_id,
  });

  if (!project) {
    return <Skeleton />;
  }

  return (
    <>
      <Grid container rowSpacing={2}>
        <Grid size={12}>
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
        </Grid>
      </Grid>
    </>
  );
}

function ProjectTryAuth(props: { project_id: number; user_id: number }) {
  const { project_id, user_id } = props;
  const { data: membership } = useProjectsDetailMembersGet({
    project_id: project_id,
    user_id: user_id,
  });
  const role = membership?.role;
  if (!role) {
    return <Skeleton />;
  }

  if (role === "Admin" || role === "Dev") {
    return <InvolvedView project_id={project_id} user_id={user_id} role={role} />;
  } else {
    return <UninvolvedView project_id={project_id} user_id={user_id} role={role} />;
  }
}

function ProjectDetailPage() {
  const { project_id: id } = useParams();
  const project_id = Number(id);

  const { data: user_data } = useSessionGet();

  return (
    <AuthorizeProjects allowedRoles={["Not Involved"]}>
      {user_data && user_data.logged ? (
        <ProjectTryAuth project_id={project_id} user_id={user_data.user_id} />
      ) : (
        <UnauthenticatedView project_id={project_id} />
      )}
    </AuthorizeProjects>
  );
}

export default ProjectDetailPage;
