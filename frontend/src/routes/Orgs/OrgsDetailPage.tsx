import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useState } from "react";
import { useParams } from "wouter";
import StyledLink from "../../components/StyledLink.tsx";
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

function OrgsInfo(props: { org_id: number }) {
  const { org_id } = props;
  const { data } = useOrgDetailGet({
    id: org_id,
  });
  const { data: projectData } = useProjectsGet({
    org_id: org_id,
  });

  if (!data) {
    return <Skeleton />;
  }

  return (
    <Stack spacing={4}>
      <Typography variant="h4" fontWeight={"bold"} align="center">
        {data.org_name}
      </Typography>
      <Paper
        sx={{
          p: 2,
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
                <OrgMember user_id={x.user_id} org_id={org_id} />
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
      <Typography variant="h6" fontWeight={"bold"}>
        Projects
      </Typography>
      <Grid container>
        {projectData?.map((x, i) => (
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
