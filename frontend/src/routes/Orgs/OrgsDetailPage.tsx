import { Add, ArrowBack, Delete, Edit } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { Link, useLocation, useParams } from "wouter";
import { APIError } from "../../helpers/fetch";
import { useOrgDetailGet, useOrgsDelete } from "../../queries/org_hooks";
import { useProjectsGet } from "../../queries/project_hooks";
import { useUserAccountDetailGet } from "../../queries/user_hooks.ts";

function UserCard(props: { user_id: number }) {
  const { user_id } = props;
  const { data } = useUserAccountDetailGet({
    user_id,
  });
  if (!data) {
    return (
      <Stack direction={"row"} alignItems={"center"} gap={2}>
        <Avatar src={undefined}></Avatar>
        <Skeleton width={"100%"}></Skeleton>
      </Stack>
    );
  }
  return (
    <Stack direction={"row"} alignItems={"center"} gap={2}>
      <Avatar src={data.user_image ?? undefined}></Avatar>
      <Typography textAlign={"center"}>{data.user_name}</Typography>
    </Stack>
  );
}

function OrgsDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data } = useOrgDetailGet({
    id: Number(id),
    retry: (failureCount, error) => {
      if ((error instanceof APIError && error.status === 404) || failureCount > 3) {
        setLocation("/orgs");
        return false;
      }
      return true;
    },
  });

  const { data: projectData } = useProjectsGet({
    org_id: Number(id),
  });

  const { mutate: deleteOrg } = useOrgsDelete({
    id: Number(id),
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Edit successful!</Typography>,
        autoHideDuration: 5000,
        variant: "success",
      });
    },
  });

  if (data && projectData) {
    return (
      <Grid container mt={2}>
        <Grid item xs={1}>
          <Link to={"/orgs"}>
            <Button startIcon={<ArrowBack />} variant="contained" fullWidth>
              Go Back
            </Button>
          </Link>
        </Grid>
        <Grid item xs={2} paddingLeft="1vw">
          <Link to={`/orgs/${id}/projects/add`}>
            <Button endIcon={<Add />} variant="contained" fullWidth>
              Add Projects
            </Button>
          </Link>
        </Grid>
        <Grid item xs={7} paddingLeft="8vw">
          <Typography variant="h4" fontWeight={"bold"} align="center" marginRight="15vw">
            {data.org_name}
          </Typography>
        </Grid>
        <Grid item xs={1}>
          <Link to={`/orgs/${id}/edit`}>
            <Button endIcon={<Edit />} variant="contained" fullWidth>
              Edit
            </Button>
          </Link>
        </Grid>
        <Grid item xs={1} paddingLeft="1vw">
          <Link to={"/orgs"}>
            <Button endIcon={<Delete />} variant="contained" fullWidth onClick={() => deleteOrg()}>
              Delete
            </Button>
          </Link>
        </Grid>

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
          <Grid container>
            <Container>
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
                {data.org_users.map((x) => (
                  <UserCard user_id={x.user_id} />
                ))}
              </Stack>
            </Container>
          </Grid>
        </Paper>
        <Grid container spacing={2} mt={2}>
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
        <Grid item xs={12}>
          <Typography>Categories</Typography>
          <Grid container spacing={1}>
            {data.org_categories.map((category, index) => (
              <Grid item key={index}>
                <Chip label={category.category_name} />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    );
  } else {
    return <></>;
  }
}

export default OrgsDetailPage;
