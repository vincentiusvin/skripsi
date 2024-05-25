import { ArrowBack, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useParams } from "wouter";
import { APIContext, APIError } from "../helpers/fetch";

function OrgsDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data } = useQuery({
    queryKey: ["orgs", "detail"],
    queryFn: () => new APIContext("GetOrgDetail").fetch(`/api/orgs/${id}`),
    retry: (failureCount, error) => {
      if ((error instanceof APIError && error.status === 401) || failureCount > 3) {
        setLocation("/orgs");
        return false;
      }
      return true;
    },
  });

  const { data: projectData } = useQuery({
    queryKey: ["projects", "collection"],
    queryFn: () => new APIContext("getProjects").fetch("/api/projects"),
    retry: (failureCount, error) => {
      if ((error instanceof APIError && error.status == 401) || failureCount > 3) {
        setLocation("/orgs");
        return false;
      }
      return true;
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
        <Grid item xs={10}>
          <Typography variant="h4" fontWeight={"bold"} align="center">
            {data.org_name}
          </Typography>
        </Grid>
        <Grid item xs={1}>
          <Button endIcon={<Edit />} variant="contained" fullWidth>
            Edit
          </Button>
        </Grid>
        <Paper
          sx={{
            p: 2,
            margin: "auto",
            maxWidth: "1000vw",
            flexGrow: 1,
            alignItems: "center",
            backgroundColor: (theme) => (theme.palette.mode === "dark" ? "#1A2027" : "#fff"),
          }}
        >
          <Grid container xs={12} md={100}>
            <Container
              sx={{
                // textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                // marginLeft: "12vw",
                width: "1000vw",
              }}
            >
              <h3>About Us</h3>
              <Typography>{data.org_description}</Typography>
              <h3>Our Address</h3>
              <Typography>{data.org_address}</Typography>
              <h3>Contact Us</h3>
              <Typography>{data.org_phone}</Typography>
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
        {/* {data.org_image && (
          <Grid item xs={12}>
            <Avatar
              src={data.org_image}
              variant="rounded"
              sx={{ height: "250px", width: "250px", margin: "auto" }}
            ></Avatar>
          </Grid>
        )}
        <Grid item xs={12}>
          <Typography>{data.org_description}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography>{data.org_address}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography>{data.org_phone}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography>Members</Typography>
          <List>
            {data.org_users.map((x, i) => (
              <ListItem key={i}>{x.name}</ListItem>
            ))}
          </List>
        </Grid> */}
      </Grid>
    );
  } else {
    return <></>;
  }
}

export default OrgsDetailPage;
