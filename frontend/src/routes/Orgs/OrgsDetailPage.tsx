import { Add, Delete, Edit, People } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
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
import { useUserAccountDetailGet, useUsersGet } from "../../queries/user_hooks.ts";

function UserCard(props: { org_id: number; user_id: number }) {
  const { user_id, org_id } = props;
  const { data: user_data } = useUserAccountDetailGet({
    user_id,
  });
  const { data: role_data } = useOrgsDetailMembersGet({
    user_id,
    org_id,
  });

  if (!user_data || !role_data) {
    return (
      <Stack direction={"row"} alignItems={"center"} gap={2}>
        <Avatar src={undefined}></Avatar>
        <Skeleton width={"100%"}></Skeleton>
      </Stack>
    );
  }
  return (
    <Stack direction={"row"} alignItems={"center"} gap={2}>
      <Avatar src={user_data.user_image ?? undefined}></Avatar>
      <Stack>
        <Typography>{user_data.user_name}</Typography>
        <Typography variant="body2" color={"GrayText"}>
          {role_data.role}
        </Typography>
      </Stack>
    </Stack>
  );
}

function InviteUser(props: { org_id: number; user_id: number }) {
  const { user_id, org_id } = props;
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

  return (
    <Stack direction={"row"} justifyContent={"space-between"} spacing={2}>
      <UserCard org_id={org_id} user_id={user_id} />
      <Button
        onClick={() => {
          putMember({
            role: "Invited",
          });
        }}
      >
        Add
      </Button>
    </Stack>
  );
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
                <InviteUser org_id={org_id} user_id={x.user_id} key={x.user_id} />
              ))}
            </Stack>
          ) : (
            <Skeleton />
          )}
        </DialogContent>
      </Dialog>
      <Button
        onClick={() => setDialogOpen(true)}
        variant="contained"
        fullWidth
        endIcon={<People />}
      >
        Invite Members
      </Button>
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

  if (!data || !projectData) {
    return <Skeleton />;
  }

  const isAdmin = role_data && role_data.role === "Admin";
  const isInvited = role_data && role_data.role === "Invited";

  return (
    <Grid container mt={2} rowGap={2}>
      <Grid item xs={2}>
        {isAdmin ? (
          <InviteUserDialog org_id={org_id} />
        ) : isInvited ? (
          <RespondInvite org_id={org_id} user_id={user_id} />
        ) : null}
      </Grid>
      <Grid item xs={8}>
        <Typography variant="h4" fontWeight={"bold"} align="center">
          {data.org_name}
        </Typography>
      </Grid>
      <Grid item xs={1}>
        {isAdmin ? (
          <Link to={`/orgs/${org_id}/edit`}>
            <Button endIcon={<Edit />} variant="contained" fullWidth>
              Edit
            </Button>
          </Link>
        ) : null}
      </Grid>
      <Grid item xs={1}>
        {isAdmin ? (
          <Link to={"/orgs"}>
            <Button endIcon={<Delete />} variant="contained" fullWidth onClick={() => deleteOrg()}>
              Delete
            </Button>
          </Link>
        ) : null}
      </Grid>

      <Grid item xs={12}>
        <Paper
          sx={{
            p: 2,
            margin: "auto",
            maxWidth: "90vw",
            flexGrow: 1,
            alignItems: "center",
            backgroundColor: (theme) => (theme.palette.mode === "dark" ? "#1A2027" : "#fff"),
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
          <Stack direction={"row"} justifyContent={"center"}>
            {data.org_users
              .filter((x) => x.user_role === "Admin")
              .map((x) => (
                <UserCard user_id={x.user_id} org_id={org_id} key={x.user_id} />
              ))}
          </Stack>
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
      <Grid item xs={10}>
        <Typography variant="h6" fontWeight={"bold"}>
          Projects
        </Typography>
      </Grid>
      <Grid item xs={2} paddingLeft="1vw">
        {isAdmin ? (
          <Link to={`/orgs/${org_id}/projects/add`}>
            <Button endIcon={<Add />} variant="contained" fullWidth>
              Add Projects
            </Button>
          </Link>
        ) : null}
      </Grid>
      {projectData.map((x, i) => (
        <Grid item xs={3} key={i}>
          <Link to={`/projects/${x.project_id}`}>
            <Card variant="elevation">
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
          </Link>
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
    return null;
  }
}

export default OrgsDetailPage;
