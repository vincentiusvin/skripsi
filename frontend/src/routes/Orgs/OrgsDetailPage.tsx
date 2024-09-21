import { Add, Delete, Edit, MoreVert, People } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import UserCard from "../../components/Cards/UserCard.tsx";
import StyledLink from "../../components/StyledLink.tsx";
import { APIError } from "../../helpers/fetch";
import {
  useOrgDetailGet,
  useOrgsDelete,
  useOrgsDetailMembersDelete,
  useOrgsDetailMembersGet,
  useOrgsDetailMembersPut,
} from "../../queries/org_hooks";
import { useProjectsGet } from "../../queries/project_hooks";
import { useSessionGet } from "../../queries/sesssion_hooks.ts";
import { useUsersGet } from "../../queries/user_hooks.ts";

function MemberCard(props: { org_id: number; user_id: number; invite?: boolean }) {
  const { user_id, org_id, invite } = props;
  const { data: role_data } = useOrgsDetailMembersGet({
    user_id,
    org_id,
  });

  const { mutate: putMember } = useOrgsDetailMembersPut({
    org_id: org_id,
    user_id: user_id,
    onSuccess: (x) => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>User berhasil ditambahkan sebagai {x.role}!</Typography>,
      });
    },
  });

  if (!invite) {
    return <UserCard user_id={user_id} subtitle={role_data?.role} />;
  } else {
    return (
      <UserCard
        user_id={user_id}
        subtitle={role_data?.role}
        sidebar={
          <Button
            onClick={() => {
              putMember({
                role: "Invited",
              });
            }}
          >
            Add
          </Button>
        }
      />
    );
  }
}

function InviteUserDialog(props: { org_id: number }) {
  const { org_id } = props;
  const { data: users } = useUsersGet();
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Add members</DialogTitle>
        <DialogContent>
          {users ? (
            <Stack gap={2}>
              {users.map((x) => (
                <MemberCard org_id={org_id} user_id={x.user_id} key={x.user_id} invite />
              ))}
            </Stack>
          ) : (
            <Skeleton />
          )}
        </DialogContent>
      </Dialog>
      <MenuItem onClick={() => setDialogOpen(true)}>
        <ListItemIcon>
          <People />
        </ListItemIcon>
        <ListItemText>Tambah Pengurus</ListItemText>
      </MenuItem>
    </>
  );
}

function RespondInvite(props: { user_id: number; org_id: number }) {
  const { user_id, org_id } = props;

  const { mutate: acceptInvite } = useOrgsDetailMembersPut({
    org_id,
    user_id,
  });

  const { mutate: rejectInvite } = useOrgsDetailMembersDelete({
    org_id,
    user_id,
  });

  return (
    <Stack direction={"row"} width={"100%"}>
      <Button
        variant="contained"
        fullWidth
        onClick={() => {
          acceptInvite({
            role: "Admin",
          });
        }}
      >
        Accept
      </Button>
      <Button
        variant="contained"
        fullWidth
        onClick={() => {
          rejectInvite();
        }}
      >
        Reject
      </Button>
    </Stack>
  );
}

function OrgsDetailAuthenticated(props: { user_id: number }) {
  const { user_id } = props;
  const { org_id: org_id_raw } = useParams();
  const [, setLocation] = useLocation();
  const org_id = Number(org_id_raw);

  const { data: role_data } = useOrgsDetailMembersGet({
    org_id,
    user_id,
  });

  const { data } = useOrgDetailGet({
    id: org_id,
    retry: (failureCount, error) => {
      if ((error instanceof APIError && error.status === 404) || failureCount > 3) {
        setLocation("/orgs");
        return false;
      }
      return true;
    },
  });

  const { data: projectData } = useProjectsGet({
    org_id: org_id,
  });

  const { mutate: deleteOrg } = useOrgsDelete({
    id: org_id,
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Edit successful!</Typography>,
        autoHideDuration: 5000,
        variant: "success",
      });
    },
  });

  const [drawerAnchor, setDrawerAnchor] = useState<HTMLElement | undefined>();

  if (!data || !projectData) {
    return <Skeleton />;
  }

  const isAdmin = role_data && role_data.role === "Admin";
  const isInvited = role_data && role_data.role === "Invited";

  return (
    <Grid container mt={2} rowGap={2}>
      <Grid size={12}>
        {isInvited ? <RespondInvite org_id={org_id} user_id={user_id} /> : null}
      </Grid>
      <Grid size={10} offset={1}>
        <Typography variant="h4" fontWeight={"bold"} align="center">
          {data.org_name}
        </Typography>
      </Grid>
      <Grid alignItems={"center"} justifyContent={"end"} display="flex" size={1}>
        {isAdmin ? (
          <>
            <IconButton onClick={(e) => setDrawerAnchor(e.currentTarget)}>
              <MoreVert />
            </IconButton>
            <Menu
              open={drawerAnchor != undefined}
              onClose={() => setDrawerAnchor(undefined)}
              anchorEl={drawerAnchor}
            >
              <StyledLink to={`/orgs/${org_id}/edit`}>
                <MenuItem>
                  <ListItemIcon>
                    <Edit />
                  </ListItemIcon>
                  <ListItemText>Edit</ListItemText>
                </MenuItem>
              </StyledLink>
              <MenuItem onClick={() => deleteOrg()}>
                <ListItemIcon>
                  <Delete />
                </ListItemIcon>
                <ListItemText>Hapus</ListItemText>
              </MenuItem>
              <InviteUserDialog org_id={org_id} />
            </Menu>
          </>
        ) : null}
      </Grid>
      <Grid size={12}>
        <Paper
          sx={{
            p: 2,
            margin: "auto",
          }}
        >
          <Typography variant="h4" fontWeight="bold" textAlign={"center"}>
            About Us
          </Typography>
          <Typography textAlign={"center"}>{data.org_description}</Typography>
          <Typography variant="h4" fontWeight="bold" textAlign={"center"}>
            Our Address
          </Typography>
          <Typography textAlign={"center"}>{data.org_address}</Typography>
          <Typography variant="h4" fontWeight="bold" textAlign={"center"}>
            Contact Us
          </Typography>
          <Typography textAlign={"center"}>{data.org_phone}</Typography>
          <Typography variant="h4" fontWeight="bold" textAlign={"center"}>
            Our Members
          </Typography>
          <Grid container width={"85%"} margin={"0 auto"} spacing={2} columnSpacing={4}>
            {data.org_users
              .filter((x) => x.user_role === "Admin")
              .map((x) => (
                <Grid
                  justifyContent={"center"}
                  key={x.user_id}
                  size={{
                    xs: 12,
                    md: 3,
                  }}
                >
                  <MemberCard user_id={x.user_id} org_id={org_id} />
                </Grid>
              ))}
          </Grid>
          <Typography textAlign={"center"} variant="h4" fontWeight={"bold"}>
            Categories
          </Typography>
          <Stack spacing={1} direction={"row"} justifyContent={"center"}>
            {data.org_categories.map((category) => (
              <Chip label={category.category_name} key={category.category_id} />
            ))}
          </Stack>
        </Paper>
      </Grid>
      <Grid
        size={{
          xs: 6,
          md: 10,
        }}
      >
        <Typography variant="h6" fontWeight={"bold"}>
          Projects
        </Typography>
      </Grid>
      <Grid
        paddingLeft="1vw"
        size={{
          xs: 6,
          md: 2,
        }}
      >
        {isAdmin ? (
          <StyledLink to={`/orgs/${org_id}/projects/add`}>
            <Button endIcon={<Add />} variant="contained" fullWidth>
              Add Projects
            </Button>
          </StyledLink>
        ) : null}
      </Grid>
      {projectData.map((x, i) => (
        <Grid
          key={i}
          size={{
            xs: 12,
            sm: 6,
            lg: 4,
          }}
        >
          <StyledLink to={`/projects/${x.project_id}`}>
            <Card>
              <CardActionArea>
                <CardContent>
                  <Stack direction={"row"} alignItems={"center"} spacing={2}>
                    <Box>
                      <Typography variant="h5" fontWeight={"bold"}>
                        {x.project_name}
                      </Typography>
                      <Typography>{x.org_id}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </StyledLink>
        </Grid>
      ))}
    </Grid>
  );
}

function OrgsDetailUnauthenticated() {
  const { org_id: org_id_raw } = useParams();
  const [, setLocation] = useLocation();
  const org_id = Number(org_id_raw);

  const { data } = useOrgDetailGet({
    id: org_id,
    retry: (failureCount, error) => {
      if ((error instanceof APIError && error.status === 404) || failureCount > 3) {
        setLocation("/orgs");
        return false;
      }
      return true;
    },
  });

  const { data: projectData } = useProjectsGet({
    org_id: org_id,
  });

  if (!data || !projectData) {
    return <Skeleton />;
  }

  return (
    <Grid container mt={2} rowGap={2}>
      <Grid size={12}>
        <Typography variant="h4" fontWeight={"bold"} align="center">
          {data.org_name}
        </Typography>
      </Grid>
      <Grid size={12}>
        <Paper
          sx={{
            p: 2,
            margin: "auto",
          }}
        >
          <Typography variant="h4" fontWeight="bold" textAlign={"center"}>
            About Us
          </Typography>
          <Typography textAlign={"center"}>{data.org_description}</Typography>
          <Typography variant="h4" fontWeight="bold" textAlign={"center"}>
            Our Address
          </Typography>
          <Typography textAlign={"center"}>{data.org_address}</Typography>
          <Typography variant="h4" fontWeight="bold" textAlign={"center"}>
            Contact Us
          </Typography>
          <Typography textAlign={"center"}>{data.org_phone}</Typography>
          <Typography variant="h4" fontWeight="bold" textAlign={"center"}>
            Our Members
          </Typography>
          <Grid container width={"85%"} margin={"0 auto"} spacing={2} columnSpacing={4}>
            {data.org_users
              .filter((x) => x.user_role === "Admin")
              .map((x) => (
                <Grid
                  justifyContent={"center"}
                  key={x.user_id}
                  size={{
                    xs: 12,
                    md: 3,
                  }}
                >
                  <MemberCard user_id={x.user_id} org_id={org_id} />
                </Grid>
              ))}
          </Grid>
          <Typography textAlign={"center"} variant="h4" fontWeight={"bold"}>
            Categories
          </Typography>
          <Stack spacing={1} direction={"row"} justifyContent={"center"}>
            {data.org_categories.map((category) => (
              <Chip label={category.category_name} key={category.category_id} />
            ))}
          </Stack>
        </Paper>
      </Grid>
      <Grid size={12}>
        <Typography variant="h6" fontWeight={"bold"}>
          Projects
        </Typography>
      </Grid>
      {projectData.map((x, i) => (
        <Grid
          key={i}
          size={{
            xs: 12,
            sm: 6,
            lg: 4,
          }}
        >
          <StyledLink to={`/projects/${x.project_id}`}>
            <Card>
              <CardActionArea>
                <CardContent>
                  <Stack direction={"row"} alignItems={"center"} spacing={2}>
                    <Box>
                      <Typography variant="h5" fontWeight={"bold"}>
                        {x.project_name}
                      </Typography>
                      <Typography>{x.org_id}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </StyledLink>
        </Grid>
      ))}
    </Grid>
  );
}

function OrgsDetailPage() {
  const { data: user_data } = useSessionGet();

  if (user_data?.logged) {
    return <OrgsDetailAuthenticated user_id={user_data.user_id} />;
  } else {
    return <OrgsDetailUnauthenticated />;
  }
}

export default OrgsDetailPage;
