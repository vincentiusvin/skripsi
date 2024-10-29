import { Home, Phone, Visibility } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useState } from "react";
import { useParams } from "wouter";
import ProjectCard from "../../components/Cards/ProjectCard.tsx";
import { useNavigation } from "../../components/Navigation/NavigationContext.ts";
import {
  useOrgDetailGet,
  useOrgsDetailMembersDelete,
  useOrgsDetailMembersGet,
  useOrgsDetailMembersPut,
} from "../../queries/org_hooks";
import { useProjectsGet } from "../../queries/project_hooks";
import { useSessionGet } from "../../queries/sesssion_hooks.ts";
import AuthorizeOrgs from "./components/AuthorizeOrgs.tsx";
import OrgMember from "./components/OrgMember.tsx";

function InvitedDialog(props: { org_id: number; user_id: number }) {
  const { org_id, user_id } = props;
  const [open, setOpen] = useState(true);

  const { mutate: acceptInvite } = useOrgsDetailMembersPut({
    org_id,
    user_id,
  });

  const { mutate: rejectInvite } = useOrgsDetailMembersDelete({
    org_id,
    user_id,
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
            rejectInvite();
          }}
        >
          Tolak
        </Button>
        <Button
          onClick={() => {
            acceptInvite({
              role: "Admin",
            });
          }}
        >
          Terima
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function OrgsBasicData(props: { org_id: number }) {
  const { org_id } = props;
  const { data } = useOrgDetailGet({
    id: org_id,
  });
  const [nav, setNav] = useNavigation();

  if (!data) {
    return <Skeleton />;
  }

  return (
    <Grid container alignItems={"center"}>
      <Grid
        size={{
          xs: 12,
          md: 2,
        }}
      >
        <Avatar
          sx={{
            height: 128,
            width: 128,
          }}
          variant="rounded"
        >
          {data.org_image}
        </Avatar>
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 10,
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h4" fontWeight={"bold"}>
            {data.org_name}
          </Typography>
          <Stack spacing={1} direction={"row"} gap={2} flexWrap={"wrap"}>
            {data.org_categories.map((category) => (
              <Chip label={category.category_name} key={category.category_id} />
            ))}
          </Stack>
          <Stack direction={"row"} spacing={4}>
            <Stack direction="row" alignItems={"center"} spacing={2}>
              <Home />
              <Box>
                <Typography fontWeight="bold">Alamat</Typography>
                <Typography>{data.org_address}</Typography>
              </Box>
            </Stack>
            <Stack direction="row" alignItems={"center"} spacing={2}>
              <Phone />
              <Box>
                <Typography fontWeight="bold">Telepon</Typography>
                <Typography>{data.org_phone}</Typography>
              </Box>
            </Stack>
          </Stack>
          <Box>
            <Button
              variant="contained"
              startIcon={<Visibility />}
              onClick={() => {
                setNav({
                  type: "orgs",
                  id: org_id,
                  open: true,
                });
              }}
              disabled={nav.type === "orgs" && nav.id === org_id && nav.open}
            >
              Buka di Dashboard
            </Button>
          </Box>
        </Stack>
      </Grid>
    </Grid>
  );
}

function OrgsPeople(props: { org_id: number }) {
  const { org_id } = props;
  const { data } = useOrgDetailGet({
    id: org_id,
  });

  if (!data) {
    return <Skeleton />;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight={"bold"}>
        Pengurus
      </Typography>
      <Divider />
      <Stack spacing={1}>
        {data.org_users
          .filter((x) => x.user_role === "Admin")
          .map((x) => (
            <OrgMember key={x.user_id} user_id={x.user_id} org_id={org_id} />
          ))}
      </Stack>
    </Stack>
  );
}

function OrgsProjects(props: { org_id: number }) {
  const { org_id } = props;

  const { data: projects } = useProjectsGet({
    org_id: org_id,
  });

  if (!projects) {
    return <Skeleton />;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight={"bold"}>
        Proyek
      </Typography>
      <Divider />
      <Grid container spacing={2}>
        {projects.map((x, i) => (
          <Grid
            key={i}
            size={{
              xs: 12,
              sm: 6,
              lg: 4,
            }}
          >
            <ProjectCard project_id={x.project_id} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

function OrgsInfo(props: { org_id: number }) {
  const { org_id } = props;
  const { data } = useOrgDetailGet({
    id: org_id,
  });

  if (!data) {
    return <Skeleton />;
  }

  return (
    <Stack spacing={4}>
      <Paper
        sx={{
          py: 2,
          px: 8,
        }}
      >
        <OrgsBasicData org_id={org_id} />
      </Paper>
      <Grid container spacing={4}>
        <Grid size={9}>
          <OrgsProjects org_id={org_id} />
        </Grid>
        <Grid size={3}>
          <OrgsPeople org_id={org_id} />
        </Grid>
      </Grid>
      <Typography textAlign={"center"}>{data.org_description}</Typography>
    </Stack>
  );
}

function OrgsLoggedIn(props: { user_id: number; org_id: number }) {
  const { user_id, org_id } = props;
  const { data: membership } = useOrgsDetailMembersGet({
    org_id,
    user_id,
  });

  const role = membership?.role;
  if (!role) {
    return <Skeleton />;
  }

  if (role === "Admin" || role === "Not Involved") {
    return <OrgsInfo org_id={org_id} />;
  }

  if (role === "Invited") {
    return (
      <>
        <InvitedDialog user_id={user_id} org_id={org_id} />
        <OrgsInfo org_id={org_id} />;
      </>
    );
  }
}

function OrgsDetailPage() {
  const { data: user_data } = useSessionGet();
  const { org_id: id } = useParams();
  const org_id = Number(id);

  return (
    <AuthorizeOrgs allowedRoles={["Not Involved"]}>
      {user_data && user_data.logged ? (
        <OrgsLoggedIn org_id={org_id} user_id={user_data.user_id} />
      ) : (
        <OrgsInfo org_id={org_id} />
      )}
    </AuthorizeOrgs>
  );
}

export default OrgsDetailPage;
